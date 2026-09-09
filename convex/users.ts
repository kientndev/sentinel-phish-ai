import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export function checkIsPro(user: { plan?: string; trialEndsAt?: number }): boolean {
  if (user.plan === "pro") return true;
  if (user.plan === "pro_trial" && user.trialEndsAt && user.trialEndsAt > Date.now()) {
    return true;
  }
  return false;
}

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

export const getUserPlanAndQuota = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject || args.clerkId;
    if (!clerkId) {
      return {
        plan: "guest",
        isPro: false,
        dailyScansCount: 0,
        remainingScans: 2,
        limit: 2,
        resetsIn: 0,
        trialEndsAt: undefined,
        trialDaysRemaining: 0,
        trialAlreadyUsed: false,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      return {
        plan: "free",
        isPro: false,
        dailyScansCount: 0,
        remainingScans: 9,
        limit: 9,
        resetsIn: 0,
        trialEndsAt: undefined,
        trialDaysRemaining: 0,
        trialAlreadyUsed: false,
      };
    }

    const isPro = checkIsPro(user);
    const dayInMs = 24 * 60 * 60 * 1000;
    const isReset = Date.now() - (user.lastScanReset ?? 0) > dayInMs;
    const currentCount = isReset ? 0 : (user.dailyScansCount ?? 0);
    const remainingScans = isPro ? 300 : Math.max(0, 9 - currentCount);
    const resetsIn = isReset ? 0 : Math.max(0, dayInMs - (Date.now() - (user.lastScanReset ?? Date.now())));
    const trialDaysRemaining = user.trialEndsAt && user.trialEndsAt > Date.now()
      ? Math.max(1, Math.ceil((user.trialEndsAt - Date.now()) / dayInMs))
      : 0;
    const trialAlreadyUsed = user.trialEndsAt !== undefined && user.trialEndsAt !== null;

    return {
      plan: user.plan || "free",
      isPro,
      dailyScansCount: currentCount,
      remainingScans,
      limit: isPro ? 300 : 9,
      resetsIn,
      trialEndsAt: user.trialEndsAt,
      trialDaysRemaining,
      trialAlreadyUsed,
    };
  },
});

export const activateTrial = mutation({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject || args.clerkId;
    if (!clerkId) {
      throw new Error("UNAUTHORIZED");
    }

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      const id = await ctx.db.insert("users", {
        clerkId,
        email: identity?.email,
        name: identity?.name,
        plan: "free",
        dailyScansCount: 0,
        lastScanReset: Date.now(),
      });
      user = await ctx.db.get(id);
    }

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // If user already used a trial (trialEndsAt was ever set)
    if (user.trialEndsAt !== undefined && user.trialEndsAt !== null) {
      return { success: false, reason: "ALREADY_USED" };
    }

    const trialEndsAt = Date.now() + 14 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(user._id, {
      plan: "pro_trial",
      trialEndsAt,
    });

    return { success: true, trialEndsAt };
  },
});

export const verifyAndConsumeScanQuota = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (!user) {
      const id = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        plan: "free",
        dailyScansCount: 1,
        lastScanReset: now,
        totalScans: 1,
        level: 1,
        xp: 0,
      });
      return { allowed: true, isPro: false, remaining: 8, limit: 9 };
    }

    const isPro = checkIsPro(user);
    if (isPro) {
      // Soft rate limit 300/day
      const isReset = now - (user.lastScanReset ?? 0) > dayInMs;
      const count = isReset ? 0 : (user.dailyScansCount ?? 0);
      if (count >= 300) {
        return {
          allowed: false,
          error: "DAILY_LIMIT_REACHED",
          limit: 300,
          resetsIn: Math.max(0, dayInMs - (now - (user.lastScanReset ?? now))),
          isPro: true,
        };
      }
      await ctx.db.patch(user._id, {
        dailyScansCount: count + 1,
        lastScanReset: isReset ? now : user.lastScanReset,
      });
      return { allowed: true, isPro: true, remaining: 300 - (count + 1), limit: 300 };
    }

    // Free Tier Check
    const isReset = now - (user.lastScanReset ?? 0) > dayInMs;
    const currentCount = isReset ? 0 : (user.dailyScansCount ?? 0);

    if (currentCount >= 9) {
      const resetsIn = Math.max(0, dayInMs - (now - (user.lastScanReset ?? now)));
      return {
        allowed: false,
        error: "DAILY_LIMIT_REACHED",
        limit: 9,
        resetsIn,
        isPro: false,
      };
    }

    await ctx.db.patch(user._id, {
      dailyScansCount: currentCount + 1,
      lastScanReset: isReset ? now : (user.lastScanReset ?? now),
    });

    return {
      allowed: true,
      isPro: false,
      remaining: 9 - (currentCount + 1),
      limit: 9,
    };
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
      plan: "free",
      dailyScansCount: 0,
      lastScanReset: Date.now(),
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
