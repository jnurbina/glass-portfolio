import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // auth-related fields
    externalId: v.string(),
    email: v.string(),
    // existing fields
    username: v.string(),
    points: v.number(),
    lastLogin: v.number(),
  })
    .index("by_externalId", ["externalId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  authAccounts: defineTable({
    provider: v.string(),
    providerId: v.string(),
    userId: v.id("users"),
  }).index("by_provider_providerId", ["provider", "providerId"]),

  authSessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expires: v.number(),
  }).index("by_token", ["token"]), 
  
  battles: defineTable({
    player1Id: v.id("users"),
    player2Id: v.optional(v.id("users")),
    status: v.string(), // "waiting", "placing", "fighting", "finished"
    winnerId: v.optional(v.id("users")),
    board1: v.any(), // Serialized board state
    board2: v.any(),
    turn: v.id("users"),
  }),
});
