import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      totalScans: 0,
      threatsBlocked: 0,
      xp: 0,
      level: 1,
    });

    return userId;
  },
});

export const updateUserStats = mutation({
  args: {
    clerkId: v.string(),
    totalScans: v.optional(v.number()),
    threatsBlocked: v.optional(v.number()),
    xp: v.optional(v.number()),
    level: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: any = {};
    if (args.totalScans !== undefined) updates.totalScans = args.totalScans;
    if (args.threatsBlocked !== undefined) updates.threatsBlocked = args.threatsBlocked;
    if (args.xp !== undefined) updates.xp = args.xp;
    if (args.level !== undefined) updates.level = args.level;

    await ctx.db.patch(user._id, updates);
  },
});
