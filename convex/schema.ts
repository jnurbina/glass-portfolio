import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    points: v.number(),
    lastLogin: v.number(),
  }).index("by_username", ["username"]),
  
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
