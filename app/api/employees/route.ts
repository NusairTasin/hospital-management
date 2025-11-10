import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        
        let query: string;
        let params: any[] = [];
        
        if (type === 'Doctor') {
            query = `
                SELECT e.*, d.Qualification, d.Specialty, d.Visit_Fee
                FROM Employee e
                JOIN Doctor d ON e.EID = d.Doctor_ID
                WHERE e.Etype = 'Doctor'
            `;
        } else if (type === 'Nurse') {
            query = `
                SELECT e.*, n.Patient_Count
                FROM Employee e
                JOIN Nurse n ON e.EID = n.Nurse_ID
                WHERE e.Etype = 'Nurse'
            `;
        } else {
            query = 'SELECT * FROM Employee';
        }
        
        const [rows] = await db.query(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const keys = Object.keys(body).filter(key => body[key] !== '' && body[key] !== null);
        const values = keys.map(key => body[key]);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');
        
        const query = `INSERT INTO employee (${columns}) VALUES (${placeholders})`;
        await db.query(query, values);
        
        return NextResponse.json({ success: true, message: 'Employee added successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { eid, ...updateData } = body;
        
        if (!eid) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
        }
        
        const keys = Object.keys(updateData).filter(key => updateData[key] !== '' && updateData[key] !== null);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(key => updateData[key]), eid];
        
        const query = `UPDATE employee SET ${setClause} WHERE eid = ?`;
        await db.query(query, values);
        
        return NextResponse.json({ success: true, message: 'Employee updated successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eid = searchParams.get('eid');
        
        if (!eid) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
        }
        
        await db.query('DELETE FROM employee WHERE eid = ?', [eid]);
        
        return NextResponse.json({ success: true, message: 'Employee deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
    }
}