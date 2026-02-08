import express from "express";

const router = express.Router();

// Simple linear projection based on historical data
router.post("/", (req, res) => {
  try {
    const {
      baseRevenue,
      baseAdSpend,
      extraSpend,
      historicalRoas = 3.5
    } = req.body;

    const roas = historicalRoas || baseRevenue / Math.max(baseAdSpend, 1);
    const projectedLift = extraSpend * Math.max(roas * 0.7, 0.8);
    const projectedRevenue = baseRevenue + projectedLift;

    return res.json({
      projectedRevenue,
      projectedLift,
      effectiveRoas: projectedRevenue / Math.max(baseAdSpend + extraSpend, 1)
    });
  } catch (err) {
    console.error("Error in simulator", err);
    return res.status(500).json({ message: "Failed to run simulation" });
  }
});

export default router;

