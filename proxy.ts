import { withAuth } from "next-auth/middleware";

// 로그인이 필요한 경로 — 미인증 시 /auth?callbackUrl=<현재경로> 로 리다이렉트
export default withAuth({
  pages: {
    signIn: "/auth",
  },
});

export const config = {
  matcher: [
    "/community/:path*",
    "/playlist/:path*",
    "/notifications/:path*",
    "/lp-editor/:path*",
    "/profile/:path*",
  ],
};
