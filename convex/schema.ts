import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Convex Auth–managed tables (users, accounts, sessions, refresh tokens,
  // verification codes, etc.). The library writes its own; we only read.
  ...authTables,

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    done: v.boolean(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    order: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Google OAuth tokens captured during sign-in. Kept in a dedicated
  // table (rather than on the users row) so accidental joins/reads on
  // user records don't leak access tokens into client-visible queries.
  googleTokens: defineTable({
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
    scope: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  battles: defineTable({
    player1Id: v.id("users"),
    player2Id: v.optional(v.id("users")),
    status: v.string(),
    winnerId: v.optional(v.id("users")),
    board1: v.any(),
    board2: v.any(),
    turn: v.id("users"),
  }),
});
