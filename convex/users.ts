import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

// Returns the signed-in user's profile, or null when unauthenticated.
// Convex Auth populates the row in `createOrUpdateUser`; this is the
// safe client-side read that surfaces it.
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
