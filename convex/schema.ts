import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scans: defineTable({
    userId: v.string(), // Clerk user ID
    url: v.string(),
    score: v.number(),
    status: v.string(), // "SAFE" | "DANGEROUS"
    timestamp: v.string(), // ISO string
    isHighRisk: v.boolean(),
  }).index("by_user", ["userId"]),

  reportedPhish: defineTable({
    url: v.string(),
    score: v.number(),
    status: v.string(),
    timestamp: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});
