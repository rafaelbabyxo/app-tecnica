import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    const userCookie = request.cookies.get('user')

    // Se não há cookie de usuário, criar um mock
    if (!userCookie && request.nextUrl.pathname.startsWith('/panel')) {
      const mockUser = {
        id: 'dev-user-id',
        name: 'Usuário Desenvolvimento',
        email: 'dev@teste.com',
        function: 'ADMIN',
        schoolId: 'dev-school-id',
        createdAt: new Date().toISOString(),
      }

      const response = NextResponse.next()
      response.cookies.set('user', JSON.stringify(mockUser), {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
      })

      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/panel/:path*'],
}
