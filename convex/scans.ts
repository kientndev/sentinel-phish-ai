import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addScan = mutation({
  args: {
    url: v.string(),
    score: v.number(),
    status: v.string(),
    isHighRisk: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to addScan");
    }

    const scanId = await ctx.db.insert("scans", {
      userId: identity.subject,
      url: args.url,
      score: args.score,
      status: args.status,
      timestamp: new Date().toISOString(),
      isHighRisk: args.isHighRisk,
    });
    return scanId;
  },
});

export const getMyScans = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("scans")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getMyStats = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { totalScans: 0, threatsBlocked: 0, dailyScans: 0 };
    }

    const scans = await ctx.db
      .query("scans")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .collect();

    const today = new Date().toDateString();
    const dailyScans = scans.filter((s: any) => new Date(s.timestamp).toDateString() === today).length;
    const threatsBlocked = scans.filter((s: any) => s.isHighRisk).length;

    return {
      totalScans: scans.length,
      threatsBlocked,
      dailyScans,
    };
  },
});

export const reportPhish = mutation({
  args: {
    url: v.string(),
    score: v.number(),
    status: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("reportedPhish", {
      url: args.url,
      score: args.score,
      status: args.status,
      timestamp: new Date().toISOString(),
    });
  },
});

export const getReports = query({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.db
      .query("reportedPhish")
      .withIndex("by_timestamp")
      .order("desc")
      .take(30);
  },
});
