import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard", "/dashboard/:path*", 
    "/pos", "/pos/:path*", 
    "/inventory", "/inventory/:path*", 
    "/internal", "/internal/:path*"
  ],
};
