import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { Etype, Name, Birthdate, Salary, Email, Address, Qualification, Specialty, Visit_Fee, Patient_Count } = body;
        
        // Find next available EID
        const [eidResult]: any = await db.query('SELECT COALESCE(MAX(EID), 0) + 1 as next_id FROM Employee');
        const nextEID = eidResult[0].next_id;
        
        // Insert employee general details
        await db.query(
            'INSERT INTO Employee (EID, Etype, Name, Birthdate, Salary, Email, Address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nextEID, Etype, Name, Birthdate, Salary, Email, Address]
        );
        
        // Insert Doctor-specific details if applicable
        if (Etype === 'Doctor') {
            await db.query(
                'INSERT INTO Doctor (Doctor_ID, Qualification, Specialty, Visit_Fee) VALUES (?, ?, ?, ?)',
                [nextEID, Qualification, Specialty, Visit_Fee || 0]
            );
        }
        
        // Insert Nurse-specific details if applicable
        if (Etype === 'Nurse') {
            await db.query(
                'INSERT INTO Nurse (Nurse_ID, Patient_Count) VALUES (?, ?)',
                [nextEID, Patient_Count || 0]
            );
        }
        
        return NextResponse.json({ success: true, message: 'Employee added successfully', EID: nextEID });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 });
    }
}

