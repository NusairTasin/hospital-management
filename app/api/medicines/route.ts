import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await db.query('SELECT * FROM Medicine');
        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
    }
}

