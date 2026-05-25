import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const hasGlaspToken = Boolean(process.env.GLASP_ACCESS_TOKEN);

  return NextResponse.json({
    ok: hasGlaspToken,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "local",
    checks: {
      GLASP_ACCESS_TOKEN: hasGlaspToken ? "configured" : "missing"
    },
    hint: hasGlaspToken
      ? "O token existe no runtime do servidor."
      : "Adicione GLASP_ACCESS_TOKEN em Vercel > Project Settings > Environment Variables e faca redeploy."
  });
}
