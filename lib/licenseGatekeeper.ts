interface LicenseCheckResult {
  valid: boolean;
  reason?: string;
}

// Gatekeeper function to check license before allowing scan
export async function checkLicenseBeforeScan(): Promise<LicenseCheckResult> {
  // Bypassed for mobile release: SentinelShield AI is free-to-use
  return { valid: true };
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
