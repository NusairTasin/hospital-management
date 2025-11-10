import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const query = `
            SELECT r.Room_ID, r.RoomType, r.RoomCost,
                   CASE 
                       WHEN EXISTS (
                           SELECT 1 FROM Allocated al 
                           WHERE al.Room_ID = r.Room_ID
                       ) THEN 'Occupied' 
                       ELSE 'Available' 
                   END as Status
            FROM Room r
        `;
        const [rows] = await db.query(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const keys = Object.keys(body).filter(key => body[key] !== '' && body[key] !== null);
        const values = keys.map(key => body[key]);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');
        
        const query = `INSERT INTO room (${columns}) VALUES (${placeholders})`;
        await db.query(query, values);
        
        return NextResponse.json({ success: true, message: 'Room added successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to add room' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { Room_ID, room_id, rid, ...updateData } = body;
        const id = Room_ID || room_id || rid;
        
        if (!id) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
        }
        
        // Only allow updating RoomType, RoomCost, and Status (Status is calculated)
        const allowedFields = ['RoomType', 'RoomCost'];
        const keys = Object.keys(updateData).filter(key => 
            allowedFields.includes(key) && 
            updateData[key] !== '' && 
            updateData[key] !== null
        );
        
        if (keys.length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }
        
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(key => updateData[key]), id];
        
        const query = `UPDATE Room SET ${setClause} WHERE Room_ID = ?`;
        await db.query(query, values);
        
        return NextResponse.json({ success: true, message: 'Room updated successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('Room_ID') || searchParams.get('room_id') || searchParams.get('rid');
        
        if (!id) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
        }
        
        // Check if room is currently allocated
        const [allocatedRows]: any = await db.query(
            'SELECT 1 FROM Allocated WHERE Room_ID = ? LIMIT 1',
            [id]
        );
        
        if (allocatedRows.length > 0) {
            return NextResponse.json({ 
                error: 'Cannot delete room that is currently allocated. Please discharge patients first.' 
            }, { status: 400 })
        }
        
        // Delete room
        await db.query('DELETE FROM Room WHERE Room_ID = ?', [id]);
        
        return NextResponse.json({ success: true, message: 'Room deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
    }
}

