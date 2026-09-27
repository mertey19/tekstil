import { NextResponse } from "next/server";

const disabled = () =>
  NextResponse.json(
    { error: "Müşteri üyeliği kullanılmıyor." },
    {
      status: 410,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    },
  );

export const GET = disabled;
export const POST = disabled;
export const PUT = disabled;
export const DELETE = disabled;
