import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth.config";

export const getAuthUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) =>
        q.eq("externalId", identity.subject),
      )
      .unique();
    return user?._id;
  },
});

export const getAuthUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) =>
        q.eq("externalId", identity.subject),
      )
      .unique();
    return user;
  },
});

export const createUser = mutation({
  args: { email: v.string(), username: v.string(), externalId: v.string() },
  handler: async (ctx, { email, username, externalId }) => {
    const userId = await ctx.db.insert("users", {
      email,
      username,
      externalId,
      points: 0,
      lastLogin: Date.now(),
    });
    return userId;
  },
});

export const updateLastLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { lastLogin: Date.now() });
  },
});