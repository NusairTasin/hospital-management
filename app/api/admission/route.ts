import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { PID, Doctor_ID, Nurse_ID, Room_ID, DaysCount, Admission_Fee } = body;
        
        // Find next available Admission ID
        const [admissionIdResult]: any = await db.query('SELECT COALESCE(MAX(Admission_ID), 0) + 1 as next_id FROM Admission');
        const nextAdmissionID = admissionIdResult[0].next_id;
        
        // Create admission record
        await db.query(
            'INSERT INTO Admission (Admission_ID, Admission_Fee) VALUES (?, ?)',
            [nextAdmissionID, Admission_Fee || 0]
        );
        
        // Allocate room to admission
        if (Room_ID) {
            await db.query(
                'INSERT INTO Allocated (Admission_ID, Room_ID, DaysCount) VALUES (?, ?, ?)',
                [nextAdmissionID, Room_ID, DaysCount || 1]
            );
        }
        
        // Assign patient, doctor, and nurse to admission
        await db.query(
            'INSERT INTO Assigned_To (PID, Doctor_ID, Nurse_ID, Admission_ID) VALUES (?, ?, ?, ?)',
            [PID, Doctor_ID, Nurse_ID, nextAdmissionID]
        );
        
        return NextResponse.json({ 
            success: true, 
            message: 'Admission created successfully',
            Admission_ID: nextAdmissionID
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create admission' }, { status: 500 });
    }
}

