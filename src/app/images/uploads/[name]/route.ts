import { database } from "@/server/cms-store";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(name))
    return new Response(null, { status: 404 });
  const media = await database()
    .prepare("SELECT bytes FROM media WHERE src=?")
    .get(`/images/uploads/${name}`);
  if (!media) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(media.bytes as Uint8Array), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
