import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type QueryCtx } from "./_generated/server";

async function requireUserId(ctx: QueryCtx) {
  // getAuthUserId returns the Convex `users` row id when the caller is
  // signed in via Convex Auth. Anything else means "not signed in" — we
  // surface that as a typed ConvexError so the client gets a clean code.
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError({ code: "Unauthorized", reason: "not_signed_in" });
  }
  return userId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const userId = await requireUserId(ctx);
    const trimmed = title.trim();
    if (trimmed.length === 0 || trimmed.length > 500) {
      throw new ConvexError({ code: "BadRequest", reason: "invalid_title" });
    }
    return await ctx.db.insert("tasks", {
      userId,
      title: trimmed,
      done: false,
      createdAt: Date.now(),
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) {
      throw new ConvexError({ code: "NotFound", reason: "task_missing" });
    }
    await ctx.db.patch(id, {
      done: !task.done,
      completedAt: !task.done ? Date.now() : undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) {
      throw new ConvexError({ code: "NotFound", reason: "task_missing" });
    }
    await ctx.db.delete(id);
  },
});
