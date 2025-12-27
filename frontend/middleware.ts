import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/equipment/:path*', '/teams/:path*', '/requests/:path*', '/reports/:path*'],
};
