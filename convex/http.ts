import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Registers /api/auth/* routes used by Convex Auth — including the OAuth
// callback that Google redirects to after sign-in. These run on the
// Convex deployment's HTTP actions URL (<deployment>.convex.site).
auth.addHttpRoutes(http);

export default http;
