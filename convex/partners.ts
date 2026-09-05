import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get partner by slug
export const getPartnerBySlug = query({
  args: {
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = args.slug;
    if (!slug) {
      return null;
    }

    try {
      const partner = await ctx.db
        .query("partners")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      return partner ?? null;
    } catch (err) {
      console.error("Error querying partner by slug:", err);
      return null;
    }
  },
});

// Get all partners
export const getAllPartners = query({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db.query("partners").collect();
    return partners;
  },
});

// Create partner
export const createPartner = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    licenseExpiry: v.number(),
  },
  handler: async (ctx, args) => {
    const partnerId = await ctx.db.insert("partners", {
      name: args.name,
      slug: args.slug,
      logoUrl: args.logoUrl,
      primaryColor: args.primaryColor,
      licenseExpiry: args.licenseExpiry,
    });
    return partnerId;
  },
});

// Update partner
export const updatePartner = mutation({
  args: {
    id: v.id("partners"),
    name: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    licenseExpiry: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Update partner by slug (for webhooks)
export const updatePartnerBySlug = mutation({
  args: {
    slug: v.string(),
    licenseExpiry: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db
      .query("partners")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!partner) {
      throw new Error("Partner not found");
    }
    
    await ctx.db.patch(partner._id, {
      licenseExpiry: args.licenseExpiry,
    });
  },
});

// Delete partner
export const deletePartner = mutation({
  args: { id: v.id("partners") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Check if partner license is valid
export const checkLicense = query({
  args: { slug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.slug) {
      return { valid: true };
    }

    try {
      const partner = await ctx.db
        .query("partners")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .first();
      
      if (!partner) {
        return { valid: false, reason: "Partner not found" };
      }
      
      const now = Date.now();
      if (partner.licenseExpiry && partner.licenseExpiry < now) {
        return { valid: false, reason: "License expired" };
      }
      
      return { valid: true };
    } catch {
      return { valid: true };
    }
  },
});
