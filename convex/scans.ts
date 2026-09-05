import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const recordScan = mutation({
  args: {
    userId: v.optional(v.string()),
    targetUrl: v.string(),
    riskScore: v.number(),
    status: v.string(),
    engineTier: v.number(),
    latencyMs: v.number(),
    threatDetails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scans", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getUserScans = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query("scans")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});
