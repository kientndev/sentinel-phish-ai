import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export { getPublicFeed } from "./reports";

export const recordScan = mutation({
  args: {
    userId: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    url: v.optional(v.string()),
    domain: v.optional(v.string()),
    verdict: v.optional(v.string()),
    riskScore: v.number(),
    status: v.optional(v.string()),
    engineTier: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    threatDetails: v.optional(v.array(v.string())),
    heuristics: v.optional(v.array(v.string())),
    isGuest: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const rawUrl = args.url || args.targetUrl || "";
    let domain = args.domain;
    if (!domain && rawUrl) {
      try {
        domain = rawUrl.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
      } catch {
        domain = "unknown";
      }
    }

    let verdict = args.verdict;
    if (!verdict) {
      if (args.riskScore >= 75) verdict = "MALICIOUS";
      else if (args.riskScore >= 40) verdict = "SUSPICIOUS";
      else verdict = "CLEAN";
    }

    const heuristics = args.heuristics || args.threatDetails || [];

    return await ctx.db.insert("scans", {
      userId: args.userId,
      targetUrl: rawUrl,
      url: rawUrl,
      domain: domain || "unknown",
      verdict,
      riskScore: args.riskScore,
      status: args.status || (verdict === "MALICIOUS" ? "DANGEROUS" : verdict === "SUSPICIOUS" ? "SUSPICIOUS" : "SAFE"),
      engineTier: args.engineTier || 1,
      latencyMs: args.latencyMs || 0,
      threatDetails: heuristics,
      heuristics,
      isGuest: args.isGuest !== undefined ? args.isGuest : !args.userId,
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
