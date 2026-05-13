
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const url = "https://exciting-octopus-660.convex.cloud";

const client = new ConvexHttpClient(url);

async function test() {
  try {
    console.log("Fetching all partners...");
    const partners = await client.query(api.partners.getAllPartners);
    console.log("Partners:", JSON.stringify(partners, null, 2));
    
    console.log("\nChecking license for 'test'...");
    const license = await client.query(api.partners.checkLicense, { slug: "test" });
    console.log("License check result:", JSON.stringify(license, null, 2));
    
    if (partners.length > 0) {
      const firstSlug = partners[0].slug;
      console.log(`\nChecking license for '${firstSlug}'...`);
      const license2 = await client.query(api.partners.checkLicense, { slug: firstSlug });
      console.log("License check result:", JSON.stringify(license2, null, 2));
    }
  } catch (error) {
    console.error("Error during Convex query:", error);
  }
}

test();
