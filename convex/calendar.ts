import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Buffer to refresh slightly before expiry so a long request doesn't
// straddle the boundary.
const TOKEN_REFRESH_BUFFER_MS = 60_000;

type GoogleTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

export type CalendarEventOut = {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string | null;
  allDay: boolean;
};

// Internal: read the signed-in user's stored Google tokens. Marked
// internal so it can't be called from the public Convex API.
export const _getTokensForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<GoogleTokens | null> => {
    const row = await ctx.db
      .query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!row) return null;
    return {
      accessToken: row.accessToken,
      refreshToken: row.refreshToken,
      expiresAt: row.expiresAt,
    };
  },
});

// Internal: persist a refreshed access token. Refresh-token never gets
// rotated by Google's refresh endpoint, but we keep the field stable.
export const _updateAccessToken = internalMutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { userId, accessToken, expiresAt }) => {
    const row = await ctx.db
      .query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!row) return;
    await ctx.db.patch(row._id, { accessToken, expiresAt });
  },
});

async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: number;
}> {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) {
    throw new ConvexError({
      code: "Misconfigured",
      reason: "google_oauth_env_missing",
    });
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ConvexError({
      code: "GoogleTokenRefreshFailed",
      status: res.status,
      body: body.slice(0, 200),
    });
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export const events = action({
  args: {},
  handler: async (ctx): Promise<{ events: CalendarEventOut[] }> => {
    const userId = (await getAuthUserId(ctx)) as Id<"users"> | null;
    if (!userId) {
      throw new ConvexError({
        code: "Unauthorized",
        reason: "not_signed_in",
      });
    }

    let tokens = await ctx.runQuery(internal.calendar._getTokensForUser, {
      userId,
    });
    if (!tokens) {
      throw new ConvexError({
        code: "NoGoogleTokens",
        reason: "sign_in_again_to_authorize_calendar",
      });
    }

    // Refresh if expired (or about to be).
    if (Date.now() + TOKEN_REFRESH_BUFFER_MS >= tokens.expiresAt) {
      if (!tokens.refreshToken) {
        throw new ConvexError({
          code: "GoogleAccessExpired",
          reason: "no_refresh_token_sign_in_again",
        });
      }
      const refreshed = await refreshAccessToken(tokens.refreshToken);
      await ctx.runMutation(internal.calendar._updateAccessToken, {
        userId,
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
      });
      tokens = { ...tokens, ...refreshed };
    }

    const params = new URLSearchParams({
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "15",
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          Accept: "application/json",
        },
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new ConvexError({
        code: "GoogleCalendarApiError",
        status: res.status,
        body: body.slice(0, 200),
      });
    }

    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        summary?: string;
        status?: string;
        location?: string;
        start: { dateTime?: string; date?: string };
        end: { dateTime?: string; date?: string };
      }>;
    };

    const events: CalendarEventOut[] = (data.items ?? [])
      .filter((e) => e.status !== "cancelled")
      .map((e) => ({
        id: e.id,
        title: e.summary ?? "Untitled",
        start: e.start.dateTime ?? e.start.date ?? "",
        end: e.end.dateTime ?? e.end.date ?? "",
        location: e.location ?? null,
        allDay: !e.start.dateTime,
      }));

    return { events };
  },
});
