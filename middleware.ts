import { NextResponse, NextRequest } from "next/server";
import { account } from "./lib/appwrite";

const protectedRoutes = ['/dashboard', '/api']

export async function middleware(request: NextRequest) {
    
    try {
        const currentUser = await account.get()
        console.log('User logged in')
        return NextResponse.next()
    } catch (error) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }
}

// export const config = {
//     matcher: ['/dashboard/:path*', '/api/:path*']
// }

export const config = {
    matcher: []
}