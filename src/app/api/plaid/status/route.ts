import { getAccessToken } from "@/lib/utils/getAccessToken";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Check if the user has a linked Plaid account
        const accessToken = await getAccessToken();
    
        return NextResponse.json({ connected: !!accessToken });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ connected: false });
    }
}