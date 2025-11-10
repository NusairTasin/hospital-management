import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await db.query('SELECT * FROM patient');
        return NextResponse.json(rows)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { Name, Gender, Birthdate, Relative_Num, Address, Phone_Numbers } = body;
        
        // Find next available PID
        const [maxResult]: any = await db.query('SELECT COALESCE(MAX(PID), 0) + 1 as next_id FROM Patient'); //remove this query
        const nextPID = maxResult[0].next_id;
        
        // Insert patient primary details
        await db.query(
            'INSERT INTO Patient (PID, Name, Gender, Birthdate, Relative_Num, Address) VALUES (?, ?, ?, ?, ?, ?)',
            [nextPID, Name, Gender, Birthdate, Relative_Num, Address]
        );
        
        // Insert phone numbers if provided
        if (Phone_Numbers && Array.isArray(Phone_Numbers)) {
            for (const phone of Phone_Numbers) {
                if (phone) {
                    await db.query(
                        'INSERT INTO Patient_Phone (PID, Phone_Number) VALUES (?, ?)',
                        [nextPID, phone]
                    );
                }
            }
        }
        
        return NextResponse.json({ success: true, message: 'Patient added successfully', PID: nextPID });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to add patient' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { PID, pid, patient_id, ...updateData } = body;
        const id = PID || pid || patient_id;
        
        if (!id) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
        }
        
        const keys = Object.keys(updateData).filter(key => updateData[key] !== '' && updateData[key] !== null);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(key => updateData[key]), id];
        
        const query = `UPDATE Patient SET ${setClause} WHERE PID = ?`;
        await db.query(query, values);
        
        return NextResponse.json({ success: true, message: 'Patient updated successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('PID') || searchParams.get('pid') || searchParams.get('patient_id');
        
        if (!id) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
        }
        
        await db.query('DELETE FROM Patient WHERE PID = ?', [id]);
        
        return NextResponse.json({ success: true, message: 'Patient deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 })
    }
}

