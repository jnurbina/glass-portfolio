import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Routes that require an authenticated session. Anything else flows through
// untouched so the public portfolio site keeps working without a login.
const isProtectedRoute = createRouteMatcher([
  "/leetdash(.*)",
  "/api/monitoring(.*)",
]);
const isSignInPage = createRouteMatcher(["/sign-in"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authed = await convexAuth.isAuthenticated();

  // Already signed in but visiting /sign-in → bounce to the dashboard.
  if (isSignInPage(request) && authed) {
    return nextjsMiddlewareRedirect(request, "/leetdash");
  }

  // Protected route + not signed in → bounce to /sign-in.
  if (isProtectedRoute(request) && !authed) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
});

export const config = {
  // Match everything except Next internals and static assets. Convex Auth
  // handles its own /api/auth/* routes within this matcher.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
