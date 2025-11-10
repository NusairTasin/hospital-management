import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await db.query('SELECT * FROM nurse n join employee e on n.nurse_id=e.eid');
        return NextResponse.json(rows)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch nurses' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // First insert into employee table
        const employeeKeys = Object.keys(body).filter(key => 
            !key.startsWith('nurse_') && 
            key !== 'nurse_id' && 
            body[key] !== '' && 
            body[key] !== null
        );
        const employeeValues = employeeKeys.map(key => body[key]);
        const employeePlaceholders = employeeKeys.map(() => '?').join(', ');
        const employeeColumns = employeeKeys.join(', ');
        
        const employeeQuery = `INSERT INTO employee (${employeeColumns}) VALUES (${employeePlaceholders})`;
        const [employeeResult]: any = await db.query(employeeQuery, employeeValues);
        const newEid = employeeResult.insertId;
        
        // Then insert into nurse table
        const nurseKeys = Object.keys(body).filter(key => 
            key.startsWith('nurse_') || key === 'nurse_id'
        );
        
        if (nurseKeys.length > 0) {
            const nurseData: any = { nurse_id: newEid };
            nurseKeys.forEach(key => {
                if (key !== 'nurse_id' && body[key] !== '' && body[key] !== null) {
                    const nurseKey = key.replace('nurse_', '');
                    nurseData[nurseKey] = body[key];
                }
            });
            
            const nurseColumns = Object.keys(nurseData).join(', ');
            const nurseValues = Object.values(nurseData);
            const nursePlaceholders = Object.keys(nurseData).map(() => '?').join(', ');
            
            const nurseQuery = `INSERT INTO nurse (${nurseColumns}) VALUES (${nursePlaceholders})`;
            await db.query(nurseQuery, nurseValues);
        }
        
        return NextResponse.json({ success: true, message: 'Nurse added successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to add nurse' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { nurse_id, eid, ...updateData } = body;
        const id = nurse_id || eid;
        
        if (!id) {
            return NextResponse.json({ error: 'Nurse ID is required' }, { status: 400 })
        }
        
        // Separate employee and nurse fields
        const employeeData: any = {};
        const nurseData: any = {};
        
        Object.keys(updateData).forEach(key => {
            if (key.startsWith('nurse_')) {
                const nurseKey = key.replace('nurse_', '');
                nurseData[nurseKey] = updateData[key];
            } else if (key !== 'nurse_id') {
                employeeData[key] = updateData[key];
            }
        });
        
        // Update employee table
        if (Object.keys(employeeData).length > 0) {
            const employeeKeys = Object.keys(employeeData).filter(key => 
                employeeData[key] !== '' && employeeData[key] !== null
            );
            const setClause = employeeKeys.map(key => `${key} = ?`).join(', ');
            const values = [...employeeKeys.map(key => employeeData[key]), id];
            const employeeQuery = `UPDATE employee SET ${setClause} WHERE eid = ?`;
            await db.query(employeeQuery, values);
        }
        
        // Update nurse table
        if (Object.keys(nurseData).length > 0) {
            const nurseKeys = Object.keys(nurseData).filter(key => 
                nurseData[key] !== '' && nurseData[key] !== null
            );
            const setClause = nurseKeys.map(key => `${key} = ?`).join(', ');
            const values = [...nurseKeys.map(key => nurseData[key]), id];
            const nurseQuery = `UPDATE nurse SET ${setClause} WHERE nurse_id = ?`;
            await db.query(nurseQuery, values);
        }
        
        return NextResponse.json({ success: true, message: 'Nurse updated successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update nurse' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('nurse_id') || searchParams.get('eid');
        
        if (!id) {
            return NextResponse.json({ error: 'Nurse ID is required' }, { status: 400 })
        }
        
        // Delete from nurse table first (due to foreign key)
        await db.query('DELETE FROM nurse WHERE nurse_id = ?', [id]);
        // Then delete from employee table
        await db.query('DELETE FROM employee WHERE eid = ?', [id]);
        
        return NextResponse.json({ success: true, message: 'Nurse deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete nurse' }, { status: 500 })
    }
}