import { NextResponse } from "next/server";
import { resolveSiteIcon } from "@/server/projects/site-icon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export const GET = async (request: Request) => {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Project URL is required." }, { status: 400 });
  }

  const iconUrl = await resolveSiteIcon(url);

  if (!iconUrl) {
    return NextResponse.json(
      { iconUrl: null },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    { iconUrl },
    {
      headers: {
        "Cache-Control": CACHE_CONTROL,
      },
    },
  );
};
