import { fetchQuery } from "convex/nextjs";
import { api } from "../convex/_generated/api";

export interface Partner {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string;
  licenseExpiry: number;
}

// Extract slug from hostname
export function getSlugFromHostname(hostname: string): string | null {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];
  
  // For localhost, return null (default branding)
  if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
    return null;
  }
  
  // Extract subdomain (slug) from hostname
  // Example: partner.sentinelphish.ai -> partner
  // Example: partner.vercel.app -> partner
  const parts = cleanHostname.split('.');
  
  // If it's a subdomain, use the first part as slug
  if (parts.length >= 2) {
    // Skip common subdomains like 'www'
    if (parts[0] !== 'www') {
      return parts[0];
    } else if (parts.length >= 3) {
      return parts[1];
    }
  }
  
  return null;
}

// Get partner by slug
export async function getPartnerBySlug(slug: string | null): Promise<Partner | null> {
  if (!slug) return null;
  
  try {
    const partner = await fetchQuery(api.partners.getPartnerBySlug, { slug });
    return partner as Partner | null;
  } catch (error) {
    console.error("Error fetching partner:", error);
    return null;
  }
}

// Check if partner license is valid
export async function checkPartnerLicense(slug: string | null): Promise<{ valid: boolean; reason?: string }> {
  if (!slug) return { valid: true }; // Default valid for no partner
  
  try {
    const result = await fetchQuery(api.partners.checkLicense, { slug });
    return result;
  } catch (error) {
    console.error("Error checking license:", error);
    return { valid: false, reason: "License check failed" };
  }
}
