import { Auth, EmailProvider } from "@convex-dev/auth";

const auth = new Auth(process.env.CONVEX_AUTH_KEY!);

auth.addProvider(new EmailProvider());

export default auth;
