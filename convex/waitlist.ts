import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// 1. Save submission to database
export const join = mutation({
  args: {
    email: v.string(),
    plan: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return { success: true, alreadyJoined: true };
    }

    const selectedPlan = args.plan || "PRO_SECOPS";
    const selectedSource = args.source || "pricing_modal";

    await ctx.db.insert("waitlist", {
      email: args.email,
      plan: selectedPlan,
      source: selectedSource,
      notified: false,
      createdAt: Date.now(),
      joinedAt: Date.now(),
    });

    // Schedule notification action
    await ctx.scheduler.runAfter(0, api.waitlist.sendNotificationEmail, {
      leadEmail: args.email,
      plan: selectedPlan,
    });

    return { success: true, alreadyJoined: false };
  },
});

// 2. Action to send email to kien@sentinelphish.com
export const sendNotificationEmail = action({
  args: {
    leadEmail: v.string(),
    plan: v.string(),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    // Graceful fallback: If no email API key is configured yet, log clearly
    if (!resendApiKey) {
      console.log(
        `[WAITLIST ALERT] New Pro Lead: ${args.leadEmail} for plan: ${args.plan}. Add RESEND_API_KEY to Convex environment variables to receive live inbox alerts.`
      );
      return;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SentinelPhish Alerts <alerts@sentinelphish.com>",
          to: ["kien@sentinelphish.com"],
          subject: `🚨 New SecOps Pro Waitlist Lead: ${args.leadEmail}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #111;">
              <h2>New SecOps Pro Waitlist Submission</h2>
              <p>A new visitor just requested early access to the Pro tier:</p>
              <ul>
                <li><strong>Lead Email:</strong> ${args.leadEmail}</li>
                <li><strong>Selected Plan:</strong> ${args.plan}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              </ul>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to send waitlist email alert:", errorText);
      }
    } catch (err) {
      console.error("Error dispatching waitlist alert email:", err);
    }
  },
});
