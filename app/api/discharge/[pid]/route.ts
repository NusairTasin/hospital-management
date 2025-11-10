import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ pid: string }> }
) {
    try {
        const { pid } = await params;
        
        // Find current admission and bed
        const [admissionRows]: any = await db.query(`
            SELECT a.Admission_ID, at.Bed_ID
            FROM Admission a
            JOIN Assigned_To at ON a.Admission_ID = at.Admission_ID
            WHERE at.PID = ? AND a.Discharge_Date IS NULL
            LIMIT 1
        `, [pid]);
        
        if (admissionRows.length === 0) {
            return NextResponse.json({ error: 'No active admission found for this patient' }, { status: 404 });
        }
        
        const { Admission_ID, Bed_ID } = admissionRows[0];
        
        // Update admission with discharge date
        await db.query(
            'UPDATE Admission SET Discharge_Date = CURRENT_DATE() WHERE Admission_ID = ?', //FIX
            [Admission_ID]
        );
        
        // Set bed as not occupied
        if (Bed_ID) {
            await db.query(
                'UPDATE Bed SET Is_Occupied = 0 WHERE Bed_ID = ?',
                [Bed_ID]
            );
        }
        
        return NextResponse.json({ success: true, message: 'Patient discharged successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to discharge patient' }, { status: 500 });
    }
}

