import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getGuestScanCount = query({
  args: { clientHash: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("guestScans")
      .withIndex("by_hash", (q) => q.eq("clientHash", args.clientHash))
      .first();
    return record ? record.count : 0;
  },
});

export const checkAndIncrementGuestScan = mutation({
  args: { clientHash: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("guestScans")
      .withIndex("by_hash", (q) => q.eq("clientHash", args.clientHash))
      .first();

    if (existing) {
      if (existing.count >= 2) {
        return { allowed: false, count: existing.count, limit: 2 };
      }
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        lastScanAt: Date.now(),
      });
      return { allowed: true, count: existing.count + 1, limit: 2 };
    } else {
      await ctx.db.insert("guestScans", {
        clientHash: args.clientHash,
        count: 1,
        lastScanAt: Date.now(),
      });
      return { allowed: true, count: 1, limit: 2 };
    }
  },
});
