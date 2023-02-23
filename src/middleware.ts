import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDataFromToken } from './utils/tokenHandler';

export async function middleware(req: NextRequest) {
  const pathName = req.nextUrl.pathname;
  const appToken = req.cookies.get('appToken')?.value;

  if (pathName === '/_next/image' || pathName === '/logo.png') {
    return NextResponse.next();
  }

  if (pathName !== '/login' && pathName !== '/passwordRecovery') {
    if (!appToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } else if (appToken) {
    const currentUser = await getDataFromToken(appToken);

    if (currentUser) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
