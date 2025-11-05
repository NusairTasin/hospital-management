import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await db.query('SELECT * FROM employee');
        return NextResponse.json(rows)
    } catch (error) {
        console.error(error)
    }
}