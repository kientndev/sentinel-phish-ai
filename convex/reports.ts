import { query } from "./_generated/server";

export const getPublicFeed = query({
  args: {},
  handler: async (ctx) => {
    // Fetch latest 50 scans ordered by createdAt descending
    const rawScans = await ctx.db
      .query("scans")
      .withIndex("by_created_at")
      .order("desc")
      .take(50);

    const scans = await Promise.all(
      rawScans.map(async (scan) => {
        const url = scan.url || scan.targetUrl || "";
        const domain =
          scan.domain ||
          (url
            ? url
                .replace(/^https?:\/\//i, "")
                .split("/")[0]
                .split(":")[0]
            : "unknown");

        let verdict = scan.verdict;
        if (!verdict) {
          if (scan.riskScore >= 75) verdict = "MALICIOUS";
          else if (scan.riskScore >= 40) verdict = "SUSPICIOUS";
          else verdict = "CLEAN";
        }

        const heuristics = scan.heuristics || scan.threatDetails || [];

        // Calculate community consensus (thumbs up / thumbs down)
        let helpfulCount = 0;
        let disputeCount = 0;

        // Query by scanId first, fallback to url
        const feedbackByScan = await ctx.db
          .query("scanFeedback")
          .filter((q) => q.eq(q.field("scanId"), scan._id))
          .collect();

        if (feedbackByScan.length > 0) {
          for (const fb of feedbackByScan) {
            if (fb.isHelpful) helpfulCount++;
            else disputeCount++;
          }
        } else if (url) {
          const feedbackByUrl = await ctx.db
            .query("scanFeedback")
            .withIndex("by_url", (q) => q.eq("url", url))
            .collect();

          for (const fb of feedbackByUrl) {
            if (fb.isHelpful) helpfulCount++;
            else disputeCount++;
          }
        }

        // Return public-safe object without private identifiers (omit userId)
        return {
          _id: scan._id,
          url,
          domain,
          verdict,
          riskScore: scan.riskScore,
          heuristics,
          helpfulCount,
          disputeCount,
          createdAt: scan.createdAt,
        };
      })
    );

    return { scans };
  },
});
