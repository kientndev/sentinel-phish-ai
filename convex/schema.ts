import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // Gamification metrics (must be optional for legacy accounts)
    level: v.optional(v.number()),
    xp: v.optional(v.number()),
    threatsBlocked: v.optional(v.number()),
    totalScans: v.optional(v.number()),

    // Plan & quota metrics
    plan: v.optional(v.string()),
    auditCount: v.optional(v.number()),
    generateCount: v.optional(v.number()),
    resetDate: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),
  partners: defineTable({
    name: v.string(),
    slug: v.string(),
    logoUrl: v.optional(v.string()),
    customDomain: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    primaryColor: v.optional(v.string()),
    licenseExpiry: v.optional(v.number()),
  })
    .index("by_slug", ["slug"]),
  
  waitlist: defineTable({
    email: v.string(),
    plan: v.string(),
    joinedAt: v.number(),
  }).index("by_email", ["email"]),

  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    attachmentIds: v.optional(v.array(v.string())), // Storage IDs
    createdAt: v.number(),
  }),

  scans: defineTable({
    userId: v.optional(v.string()),
    targetUrl: v.string(),
    riskScore: v.number(),
    status: v.string(),
    engineTier: v.number(),
    latencyMs: v.number(),
    threatDetails: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]),
});

