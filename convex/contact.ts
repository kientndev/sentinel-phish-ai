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

    // Optionally notify admin (re-using the logic from notifications)
    try {
      await ctx.scheduler.runAfter(0, api.notifications.notifyAdmin, {
        type: "waitlist", // We'll just reuse waitlist type or update notifyAdmin to support contact again
        data: {
          email: args.email,
          plan: `CONTACT: ${args.subject}`,
        }
      });
    } catch (e) {
      console.error("Failed to trigger notification", e);
    }

    return id;
  },
});
