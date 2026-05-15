import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const send = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    attachmentIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contacts", {
      ...args,
      createdAt: Date.now(),
    });

    // Trigger admin notification
    try {
      await ctx.scheduler.runAfter(0, api.notifications.notifyAdmin, {
        type: "contact",
        data: {
          name: args.name,
          email: args.email,
          subject: args.subject,
          message: args.message,
        }
      });
    } catch (e) {
      console.error("Failed to trigger notification", e);
    }

    return id;
  },
});
