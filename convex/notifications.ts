import { v } from "convex/values";
import { action } from "./_generated/server";

export const notifyAdmin = action({
  args: {
    type: v.literal("waitlist"),
    data: v.object({
      email: v.string(),
      plan: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return;
    }

    const to = "kien.eat.pizza@gmail.com";
    const subject = "New Waitlist Signup";
    const body = `New waitlist signup: ${args.data.email} for plan ${args.data.plan}`;

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
