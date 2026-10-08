import { auth } from "@/auth";

export default auth((req) => {
  const user = req.auth?.user;
  const email = user?.email;
  const allowedEmail = process.env.ALLOWED_EMAIL;

  const path = req.nextUrl.pathname;

  const isLoginPage = path === "/login";
  const isAuthRoute = path.startsWith("/api/auth");

  if (isLoginPage || isAuthRoute) return;

  // Not logged in
  if (!user) {
    return Response.redirect(new URL("/login", req.url));
  }

  
  if (email !== allowedEmail) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};