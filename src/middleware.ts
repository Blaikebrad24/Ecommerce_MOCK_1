
import { NextRequest, NextResponse } from "next/server"
import { isValidPassword } from "./lib/isValidPassword";

export async function middleware(request: NextRequest){

    //check authentication
    if((await isAuthenticated(request)) === false)
        {
            return new NextResponse("Unauthorized", 
            { status: 401, headers:{ "WWW-Authenticate": "Basic"}})
        }


}

async function isAuthenticated(request: NextRequest)
{
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

    if(authHeader == null) return false;

    //correct 
    const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":"); // username:password result
    // console.log(`${username}:${password}`);
    return (username === process.env.ADMIN_USERNAME && (await isValidPassword(password, process.env.HASHED_ADMIN_PASSWORD as string)))
}



// runs whenever we want to access an admin page or any route within directory
export const config = {
    matcher: "/admin/:path*",
}