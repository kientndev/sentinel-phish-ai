import { v } from "convex/values";
import { action } from "./_generated/server";

export const notifyAdmin = action({
  args: {
    type: v.union(v.literal("waitlist"), v.literal("contact")),
    data: v.object({
      name: v.optional(v.string()),
      email: v.string(),
      plan: v.optional(v.string()),
      subject: v.optional(v.string()),
      message: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return;
    }

    const to = "kien.eat.pizza@gmail.com";
    const subject = args.type === "waitlist" 
      ? "🛡️ New Waitlist Signup - SentinelPhish" 
      : `📩 New Contact Message: ${args.data.subject || "No Subject"}`;
    
    const body = args.type === "waitlist"
      ? `New waitlist signup received:\n\nEmail: ${args.data.email}\nPlan: ${args.data.plan}\n\nTimestamp: ${new Date().toLocaleString()}`
      : `New contact form submission:\n\nFrom: ${args.data.name} (${args.data.email})\nSubject: ${args.data.subject}\n\nMessage:\n${args.data.message}\n\nTimestamp: ${new Date().toLocaleString()}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "SentinelPhish Outreach <onboarding@resend.dev>",
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
