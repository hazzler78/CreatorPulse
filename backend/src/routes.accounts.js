import express from "express";
import { supabase } from "./config.js";

const router = express.Router();

// In-memory fallback for local testing when Supabase isn't configured
const inMemoryAccounts = [];

// GET /api/accounts - list connected accounts for current user
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.sub || "demo-user";

    if (!supabase) {
      const accounts = inMemoryAccounts.filter((a) => a.user_id === userId);
      return res.json({ accounts });
    }

    const { data, error } = await supabase
      .from("platform_accounts")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return res.json({ accounts: data ?? [] });
  } catch (err) {
    console.error("Error fetching accounts", err);
    return res.status(500).json({ message: "Failed to fetch accounts" });
  }
});

// POST /api/accounts - add or update an account
router.post("/", async (req, res) => {
  try {
    const userId = req.user?.sub || "demo-user";
    const { platform, handle, mode = "demo" } = req.body || {};

    if (!platform || !handle) {
      return res.status(400).json({ message: "platform and handle are required" });
    }

    if (!supabase) {
      const existingIndex = inMemoryAccounts.findIndex(
        (a) => a.user_id === userId && a.platform === platform
      );

      const account = {
        id: `${userId}-${platform}`,
        user_id: userId,
        platform,
        handle,
        status: mode === "demo" ? "demo" : "connected"
      };

      if (existingIndex >= 0) {
        inMemoryAccounts[existingIndex] = account;
      } else {
        inMemoryAccounts.push(account);
      }

      return res.status(201).json({ account });
    }

    const { data, error } = await supabase
      .from("platform_accounts")
      .upsert(
        {
          user_id: userId,
          platform,
          handle,
          status: mode === "demo" ? "demo" : "connected"
        },
        { onConflict: "user_id,platform" }
      )
      .select()
      .maybeSingle();

    if (error) throw error;

    return res.status(201).json({ account: data });
  } catch (err) {
    console.error("Error saving account", err);
    return res.status(500).json({ message: "Failed to save account" });
  }
});

export default router;

