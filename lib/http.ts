import { NextResponse } from "next/server";
import { GlaspApiError } from "@/lib/glasp";

export function apiError(error: unknown) {
  if (error instanceof GlaspApiError) {
    return NextResponse.json(
      {
        error: error.message,
        status: error.status || 500
      },
      { status: error.status || 500 }
    );
  }

  const message = error instanceof Error ? error.message : "Erro inesperado.";
  return NextResponse.json({ error: message, status: 500 }, { status: 500 });
}
