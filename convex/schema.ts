import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    totalScans: v.number(),
    threatsBlocked: v.number(),
    xp: v.number(),
    level: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_xp", ["xp"]),
  partners: defineTable({
    name: v.string(),
    slug: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    licenseExpiry: v.number(), // Timestamp in milliseconds
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
    userId: v.optional(v.string()), // Clerk user ID
    targetUrl: v.string(),
    riskScore: v.number(),
    status: v.string(), // "SAFE" | "SUSPICIOUS" | "MALICIOUS" | "DANGEROUS"
    engineTier: v.number(), // 1, 2, or 3
    latencyMs: v.number(),
    threatDetails: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_created_at", ["createdAt"]),
});

