import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.burnfm.com/";

const ALLOWED_AREAS = new Set([
  "radio_show",
  "settings",
  "schedule",
  "podcast",
  "committee",
  "overrides",
]);

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  //authentication
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Unauthorised" },
      { status: 401 },
    );
  }

  const email = session.user.email.toLowerCase();
  const allowedEmail = process.env.ALLOWED_EMAIL?.toLowerCase();

  if (!allowedEmail || email !== allowedEmail) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  //checking token exists
  const token = process.env.API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Server configuration error" },
      { status: 500 },
    );
  }

  //check path
  const { path } = await context.params;

  if (
    !path.length ||
    !ALLOWED_AREAS.has(path[0]) ||
    path.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid API path" },
      { status: 400 },
    );
  }

  const targetUrl = new URL(
    path.map(encodeURIComponent).join("/"),
    API_BASE_URL,
  );

  targetUrl.search = request.nextUrl.search;

  //content of request
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  // method and body
  const method = request.method;
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  //make request to API
  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "error",
    });

    const responseBody = await upstream.arrayBuffer();

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "PHP API request failed" },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
