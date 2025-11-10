import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { Medicine_Name, Medicine_Cost } = body;
        
        // Find next available Medicine ID
        const [medIdResult]: any = await db.query('SELECT COALESCE(MAX(Medicine_ID), 0) + 1 as next_id FROM Medicine');
        const nextMedID = medIdResult[0].next_id;
        
        await db.query(
            'INSERT INTO Medicine (Medicine_ID, Medicine_Name, Medicine_Cost) VALUES (?, ?, ?)',
            [nextMedID, Medicine_Name, Medicine_Cost]
        );
        
        return NextResponse.json({ success: true, message: 'Medicine added successfully', Medicine_ID: nextMedID });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to add medicine' }, { status: 500 });
    }
}

