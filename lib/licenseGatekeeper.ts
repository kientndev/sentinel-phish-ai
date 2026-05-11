import { checkPartnerLicense, getSlugFromHostname } from "./partner";

interface LicenseCheckResult {
  valid: boolean;
  reason?: string;
}

// Gatekeeper function to check license before allowing scan
export async function checkLicenseBeforeScan(): Promise<LicenseCheckResult> {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const slug = getSlugFromHostname(hostname);
  
  // If no partner slug, allow scan (default branding)
  if (!slug) {
    return { valid: true };
  }
  
  // Check partner license
  const result = await checkPartnerLicense(slug);
  return result;
}

// Error message for expired license
export function getLicenseErrorMessage(reason?: string): string {
  switch (reason) {
    case "License expired":
      return "Your license has expired. Please contact your administrator to renew.";
    case "Partner not found":
      return "Invalid partner configuration. Please contact support.";
    default:
      return "License check failed. Please try again later.";
  }
}
