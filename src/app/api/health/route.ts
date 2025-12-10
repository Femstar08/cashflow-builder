import { NextResponse } from "next/server";
import { getCacheHeaders } from "@/lib/cache";
import { getSupabaseAdmin } from "@/lib/supabase/client";

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    services: {
      database: "unknown",
      openai: "unknown",
    },
  };

  // Check database connection
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("cf_users").select("count").limit(1);
    checks.services.database = error ? "unhealthy" : "healthy";
  } catch (error) {
    checks.services.database = "unhealthy";
    checks.status = "degraded";
  }

  // Check OpenAI configuration (don't make actual API call)
  checks.services.openai = process.env.OPENAI_API_KEY ? "configured" : "not_configured";
  if (!process.env.OPENAI_API_KEY) {
    checks.status = "degraded";
  }

  const statusCode = checks.status === "healthy" ? 200 : 503;

  return NextResponse.json(
    checks,
    {
      status: statusCode,
      headers: getCacheHeaders(10) // Cache health check for 10 seconds
    }
  );
}

