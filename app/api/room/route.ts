import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { Room_ID, RoomType, RoomCost, Capacity } = body;
        
        if (!Room_ID || !RoomType || RoomCost === undefined) {
            return NextResponse.json({ error: 'Room_ID, RoomType, and RoomCost are required' }, { status: 400 });
        }
        
        await db.query(
            'INSERT INTO Room (Room_ID, RoomType, RoomCost) VALUES (?, ?, ?)',
            [Room_ID, RoomType, RoomCost]
        );
        
        return NextResponse.json({ success: true, message: 'Room added successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to add room' }, { status: 500 });
    }
}

