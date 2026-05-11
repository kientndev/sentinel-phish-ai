import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";

// LemonSqueezy webhook secret
const WEBHOOK_SECRET = "illke#this12(";

interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      partner_slug?: string;
    };
    test_mode: boolean;
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      created_at: string;
      first_invoice_item?: {
        id: string;
        attributes: {
          product_id: string;
          variant_id: string;
        };
      };
      variant_id?: string;
      product_id?: string;
      customer_email?: string;
    };
  };
}

// Verify LemonSqueezy webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET not set");
    return false;
  }

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get("x-lemon-squeezy-signature");
    if (!signature) {
      console.error("Missing x-lemon-squeezy-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Get raw body
    const body = await request.text();
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook event
    const event: LemonSqueezyWebhookEvent = JSON.parse(body);
    const { meta, data } = event;

    console.log("=== LemonSqueezy Webhook Received ===");
    console.log("Event:", meta.event_name);
    console.log("Test Mode:", meta.test_mode);

    // Handle order_created event
    if (meta.event_name === "order_created") {
      const partnerSlug = meta.custom_data?.partner_slug;
      const customerEmail = data.attributes.customer_email;
      const orderId = data.id;
      const status = data.attributes.status;
      
      console.log("=== Order Created Details ===");
      console.log("Order ID:", orderId);
      console.log("Customer Email:", customerEmail);
      console.log("Partner Slug:", partnerSlug);
      console.log("Status:", status);

      if (!partnerSlug) {
        console.error("No partner_slug in custom_data");
        return NextResponse.json({ error: "Missing partner_slug" }, { status: 400 });
      }

      // Verify payment status
      if (status !== "paid") {
        console.log("Payment not verified, status:", status);
        return NextResponse.json({ message: "Payment not verified" }, { status: 200 });
      }

      // Set license expiry to 1 year from now
      const licenseExpiry = Date.now() + (365 * 24 * 60 * 60 * 1000);
      const expiryDate = new Date(licenseExpiry).toISOString();

      console.log("=== License Details ===");
      console.log("License Expiry:", expiryDate);
      console.log("License Duration: 1 year");
      console.log("Status: Active");

      // Update partner license expiry in Convex
      try {
        await fetchMutation(api.partners.updatePartnerBySlug, {
          slug: partnerSlug,
          licenseExpiry,
        });
        console.log(`✅ Successfully updated license expiry for partner ${partnerSlug} to ${expiryDate}`);
      } catch (error) {
        console.error("❌ Failed to update partner license:", error);
        return NextResponse.json({ error: "Failed to update license" }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
