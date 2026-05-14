import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const join = mutation({
  args: {
    email: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      return { success: true, message: "Already on waitlist" };
    }

    const id = await ctx.db.insert("waitlist", {
      email: args.email,
      plan: args.plan,
      joinedAt: Date.now(),
    });

    // Trigger notification action
    await ctx.scheduler.runAfter(0, api.contact.notifyAdmin, {
      type: "waitlist",
      data: {
        email: args.email,
        plan: args.plan,
      }
    });

    return { success: true, id };
  },
});
