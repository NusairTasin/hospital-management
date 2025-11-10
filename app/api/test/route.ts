import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { TestName, TestCost } = body;
        
        // Find next available Test ID
        const [testIdResult]: any = await db.query('SELECT COALESCE(MAX(Test_ID), 0) + 1 as next_id FROM Test');
        const nextTestID = testIdResult[0].next_id;
        
        await db.query(
            'INSERT INTO Test (Test_ID, TestName, TestCost) VALUES (?, ?, ?)',
            [nextTestID, TestName, TestCost]
        );
        
        return NextResponse.json({ success: true, message: 'Test added successfully', Test_ID: nextTestID });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to add test' }, { status: 500 });
    }
}

