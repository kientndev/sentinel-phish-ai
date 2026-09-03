import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    const scanId = await ctx.db.insert("scans", {
      userId: args.userId,
      targetUrl: args.targetUrl,
      riskScore: args.riskScore,
      status: args.status,
      engineTier: args.engineTier,
      latencyMs: args.latencyMs,
      threatDetails: args.threatDetails,
      createdAt: Date.now(),
    });

    // If there's an associated Clerk user, update their aggregate stats
    if (args.userId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId!))
        .first();

      if (user) {
        const isBlocked = args.riskScore >= 70;
        await ctx.db.patch(user._id, {
          totalScans: (user.totalScans || 0) + 1,
          threatsBlocked: (user.threatsBlocked || 0) + (isBlocked ? 1 : 0),
          xp: (user.xp || 0) + (isBlocked ? 25 : 10),
        });
      }
    }

    return scanId;
  },
});

export const getUserScans = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const scans = await ctx.db
      .query("scans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    return scans;
  },
});
