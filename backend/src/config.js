import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export const PORT = process.env.PORT || 4000;

export const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    : null;

export const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

export const authConfig = {
  provider: process.env.AUTH_PROVIDER || "auth0", // or "clerk"
  audience: process.env.AUTH_AUDIENCE || "",
  issuer: process.env.AUTH_ISSUER || ""
};

