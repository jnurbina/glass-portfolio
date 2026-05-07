import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { GenericDatabaseWriter } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

const OWNER_EMAIL = "jnurbina@gmail.com";

// Origins allowed to receive the post-sign-in redirect. Convex Auth's
// default policy only allows redirects within SITE_URL, which forces a
// single-origin deployment. We host the same Convex backend behind
// multiple origins (production, branch-stable Vercel previews, local
// dev) so we explicitly allow each one here.
function isTrustedRedirectOrigin(url: URL): boolean {
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    return false;
  }
  if (url.hostname === "www.onejas.one" || url.hostname === "onejas.one") {
    return true;
  }
  if (url.hostname === "localhost") {
    return true;
  }
  // Vercel preview aliases scoped to this project + team
  // (e.g. onejasone-git-feature-leetdash-1jas1.vercel.app, plus per-deploy
  // aliases like onejasone-abc123-1jas1.vercel.app).
  if (/^onejasone-[a-z0-9-]+-1jas1\.vercel\.app$/.test(url.hostname)) {
    return true;
  }
  return false;
}

// Carries the OAuth tokens through Convex Auth's user-profile pipeline so
// `createOrUpdateUser` can persist them. The `__tokens` field is stripped
// before anything is written to the users row.
type CarriedTokens = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number; // unix seconds
  scope?: string;
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      // Ask Google for offline-access + Calendar read scope so server-side
      // calendar fetches keep working after the initial 1h access token
      // expires. `prompt=consent` makes Google re-issue the refresh token
      // even if the user previously consented (otherwise it's only sent on
      // the very first authorization for this client).
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly",
        },
      },
      // Carry the OAuth tokens through to createOrUpdateUser via the
      // profile object. They get extracted there and persisted into the
      // `googleTokens` table (separate from the users row).
      profile(profile, tokens) {
        const carried: CarriedTokens = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at:
            typeof tokens.expires_at === "number" ? tokens.expires_at : undefined,
          scope: typeof tokens.scope === "string" ? tokens.scope : undefined,
        };
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          __tokens: carried,
        };
      },
    }),
  ],
  callbacks: {
    // Allow the sign-in page to pass an absolute redirectTo that points
    // at any of our trusted origins (prod, preview branch alias, local
    // dev). Relative paths still resolve against SITE_URL.
    async redirect({ redirectTo }) {
      if (redirectTo.startsWith("/") || redirectTo.startsWith("?")) {
        const base = (process.env.SITE_URL ?? "").replace(/\/$/, "");
        return `${base}${redirectTo}`;
      }
      try {
        const url = new URL(redirectTo);
        if (isTrustedRedirectOrigin(url)) {
          return redirectTo;
        }
      } catch {
        // fallthrough → reject
      }
      throw new ConvexError({
        code: "Forbidden",
        reason: "untrusted_redirect",
      });
    },

    // Owner-only allowlist. Any email other than OWNER_EMAIL is rejected
    // before a user record is created — no leaked rows for unauthorized
    // sign-in attempts.
    async createOrUpdateUser(ctx, { existingUserId, profile }) {
      const email =
        typeof profile.email === "string" ? profile.email.toLowerCase() : null;
      if (email !== OWNER_EMAIL) {
        throw new ConvexError({
          code: "Forbidden",
          reason: "owner_only",
        });
      }

      const carried = (profile as { __tokens?: CarriedTokens }).__tokens;

      let userId = existingUserId;
      if (userId) {
        await ctx.db.patch(userId, {
          email,
          name:
            typeof profile.name === "string" ? profile.name : undefined,
          image:
            typeof profile.image === "string" ? profile.image : undefined,
        });
      } else {
        userId = await ctx.db.insert("users", {
          email,
          name: typeof profile.name === "string" ? profile.name : undefined,
          image: typeof profile.image === "string" ? profile.image : undefined,
        });
      }

      // Persist Google tokens into the dedicated googleTokens table.
      // Refresh tokens are only emitted on first consent (or when the
      // app sets prompt=consent); preserve any existing one if Google
      // omits it on subsequent sign-ins.
      //
      // Convex Auth's callback ctx is generic (AnyDataModel), so we cast
      // ctx.db to the typed writer to use our schema's `by_user` index.
      if (carried?.access_token && carried.expires_at) {
        const db = ctx.db as unknown as GenericDatabaseWriter<DataModel>;
        const existing = await db
          .query("googleTokens")
          .withIndex("by_user", (q) => q.eq("userId", userId!))
          .unique();
        const refreshToken =
          carried.refresh_token ?? existing?.refreshToken ?? undefined;
        const tokenRow = {
          userId,
          accessToken: carried.access_token,
          refreshToken,
          // Google's `expires_at` is unix seconds; convert to ms.
          expiresAt: carried.expires_at * 1000,
          scope: carried.scope,
        };
        if (existing) {
          await db.patch(existing._id, tokenRow);
        } else {
          await db.insert("googleTokens", tokenRow);
        }
      }

      return userId;
    },
  },
});
