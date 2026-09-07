import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const submitScanFeedback = mutation({
  args: {
    url: v.string(),
    isHelpful: v.boolean(),
    scanId: v.optional(v.id("scans")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    await ctx.db.insert("scanFeedback", {
      url: args.url,
      isHelpful: args.isHelpful,
      scanId: args.scanId,
      userId: userId ?? undefined,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
