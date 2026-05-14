import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export interface Partner {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string;
  licenseExpiry: number;
}

export const DEFAULT_PARTNER: Partner = {
  _id: "default",
  name: "Sentinel Admin",
  slug: "sentinel-admin",
  primaryColor: "#3b82f6",
  licenseExpiry: 1767225600000, // Dec 31, 2025 approx
};

// Extract slug from hostname
export function getSlugFromHostname(hostname: string): string | null {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];
  
  // For localhost, return null (default branding)
  if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
    return null;
  }
  
  // Extract subdomain (slug) from hostname
  const parts = cleanHostname.split('.');
  
  if (parts.length >= 2) {
    const slug = parts[0] === 'www' ? (parts.length >= 3 ? parts[1] : null) : parts[0];
    
    // Treat the main app domain and Vercel preview domains as no partner (null)
    if (
      slug === "sentinelphishai" || 
      slug === "sentinel-phish" || 
      (slug?.includes("sentinelphishai") && cleanHostname.endsWith(".vercel.app"))
    ) {
      return null;
    }
    
    return slug;
  }
  
  return null;
}

// Get partner by slug
export async function getPartnerBySlug(slug: string | null): Promise<Partner | null> {
  if (!slug) return null;
  
  // Frontend fallback for admin
  if (slug === "sentinel-admin") {
    return DEFAULT_PARTNER;
  }

  if (!convex) return null;
  
  try {
    const partner = await convex.query(api.partners.getPartnerBySlug, { slug });
    return (partner as Partner | null) || (slug === "sentinel-admin" ? DEFAULT_PARTNER : null);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return slug === "sentinel-admin" ? DEFAULT_PARTNER : null;
  }
}

// Check if partner license is valid
export async function checkPartnerLicense(slug: string | null): Promise<{ valid: boolean; reason?: string }> {
  if (!slug || slug === "sentinel-admin") return { valid: true }; 
  
  if (!convex) {
    console.warn("Convex client not initialized");
    return { valid: true }; // Fallback to valid if client is missing
  }
  
  try {
    const result = await convex.query(api.partners.checkLicense, { slug });
    
    // If partner not found but it's our admin fallback, allow it
    if (!result.valid && result.reason === "Partner not found" && slug === "sentinel-admin") {
      return { valid: true };
    }
    
    return result;
  } catch (error) {
    console.error("Error checking license:", error);
    return { valid: false, reason: "License check failed" };
  }
}
