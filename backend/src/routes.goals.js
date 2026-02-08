import express from "express";
import { supabase } from "./config.js";

const router = express.Router();

// GET /api/goals - fetch current user's goals
router.get("/", async (req, res) => {
  try {
    if (!supabase) {
      // Demo fallback if Supabase isn't configured yet
      return res.json({
        goal: {
          previous_revenue: 0,
          current_revenue: 2600,
          growth_target_percent: 30
        }
      });
    }

    const userId = req.user?.sub || "demo-user";
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.json({
        goal: {
          previous_revenue: 0,
          current_revenue: 0,
          growth_target_percent: 30
        }
      });
    }

    return res.json({ goal: data });
  } catch (err) {
    console.error("Error fetching goals", err);
    return res.status(500).json({ message: "Failed to fetch goals" });
  }
});

// POST /api/goals - upsert a goal
router.post("/", async (req, res) => {
  try {
    const {
      previousRevenue,
      currentRevenue,
      growthTargetPercent
    } = req.body;

    if (!supabase) {
      return res.status(501).json({
        message:
          "Supabase is not configured yet. Set SUPABASE_URL and SUPABASE_ANON_KEY."
      });
    }

    const userId = req.user?.sub || "demo-user";

    const { data, error } = await supabase
      .from("goals")
      .upsert(
        {
          user_id: userId,
          previous_revenue: previousRevenue,
          current_revenue: currentRevenue,
          growth_target_percent: growthTargetPercent
        },
        { onConflict: "user_id" }
      )
      .select()
      .maybeSingle();

    if (error) throw error;

    return res.status(201).json({ goal: data });
  } catch (err) {
    console.error("Error saving goal", err);
    return res.status(500).json({ message: "Failed to save goal" });
  }
});

export default router;

