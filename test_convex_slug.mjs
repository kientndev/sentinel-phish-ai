
import { ConvexHttpClient } from "convex/browser";
import pkg from "./convex/_generated/api.js";
const { api } = pkg;

const url = "https://exciting-octopus-660.convex.cloud";

const client = new ConvexHttpClient(url);

async function test() {
  try {
    const slug = "sentinelphish";
    console.log(`Checking license for '${slug}'...`);
    const license = await client.query(api.partners.checkLicense, { slug });
    console.log("License check result:", JSON.stringify(license, null, 2));
  } catch (error) {
    console.error("Error during Convex query:", error);
  }
}

test();
