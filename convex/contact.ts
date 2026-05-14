import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const send = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    attachmentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contacts", {
      ...args,
      createdAt: Date.now(),
    });
    
    // Trigger notification action
    await ctx.scheduler.runAfter(0, api.contact.notifyAdmin, {
      type: "contact",
      data: {
        name: args.name,
        email: args.email,
        message: args.message,
      }
    });

    return id;
  },
});

export const notifyAdmin = action({
  args: {
    type: v.union(v.literal("contact"), v.literal("waitlist")),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return;
    }

    const to = args.type === "waitlist" ? "kien.eat.pizza@gmail.com" : "trikientrannam@gmail.com";
    const subject = args.type === "waitlist" ? "New Waitlist Signup" : "New Contact Form Message";
    
    const body = args.type === "waitlist" 
      ? `New waitlist signup: ${args.data.email} for plan ${args.data.plan}`
      : `New message from ${args.data.name} (${args.data.email}):\n\n${args.data.message}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "SentinelPhish <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email via Resend:", error);
    }
  },
});
