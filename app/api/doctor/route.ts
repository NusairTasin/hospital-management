import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [rows] = await db.query('SELECT * FROM doctor d join employee e on d.doctor_id=e.eid');
        return NextResponse.json(rows)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // First insert into employee table
        const employeeKeys = Object.keys(body).filter(key => 
            !key.startsWith('doctor_') && 
            key !== 'doctor_id' && 
            body[key] !== '' && 
            body[key] !== null
        );
        const employeeValues = employeeKeys.map(key => body[key]);
        const employeePlaceholders = employeeKeys.map(() => '?').join(', ');
        const employeeColumns = employeeKeys.join(', ');
        
        const employeeQuery = `INSERT INTO employee (${employeeColumns}) VALUES (${employeePlaceholders})`;
        const [employeeResult]: any = await db.query(employeeQuery, employeeValues);
        const newEid = employeeResult.insertId;
        
        // Then insert into doctor table
        const doctorKeys = Object.keys(body).filter(key => 
            key.startsWith('doctor_') || key === 'doctor_id'
        );
        
        if (doctorKeys.length > 0) {
            const doctorData: any = { doctor_id: newEid };
            doctorKeys.forEach(key => {
                if (key !== 'doctor_id' && body[key] !== '' && body[key] !== null) {
                    const doctorKey = key.replace('doctor_', '');
                    doctorData[doctorKey] = body[key];
                }
            });
            
            const doctorColumns = Object.keys(doctorData).join(', ');
            const doctorValues = Object.values(doctorData);
            const doctorPlaceholders = Object.keys(doctorData).map(() => '?').join(', ');
            
            const doctorQuery = `INSERT INTO doctor (${doctorColumns}) VALUES (${doctorPlaceholders})`;
            await db.query(doctorQuery, doctorValues);
        }
        
        return NextResponse.json({ success: true, message: 'Doctor added successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to add doctor' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { doctor_id, eid, ...updateData } = body;
        const id = doctor_id || eid;
        
        if (!id) {
            return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 })
        }
        
        // Separate employee and doctor fields
        const employeeData: any = {};
        const doctorData: any = {};
        
        Object.keys(updateData).forEach(key => {
            if (key.startsWith('doctor_')) {
                const doctorKey = key.replace('doctor_', '');
                doctorData[doctorKey] = updateData[key];
            } else if (key !== 'doctor_id') {
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
        
        // Update doctor table
        if (Object.keys(doctorData).length > 0) {
            const doctorKeys = Object.keys(doctorData).filter(key => 
                doctorData[key] !== '' && doctorData[key] !== null
            );
            const setClause = doctorKeys.map(key => `${key} = ?`).join(', ');
            const values = [...doctorKeys.map(key => doctorData[key]), id];
            const doctorQuery = `UPDATE doctor SET ${setClause} WHERE doctor_id = ?`;
            await db.query(doctorQuery, values);
        }
        
        return NextResponse.json({ success: true, message: 'Doctor updated successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('doctor_id') || searchParams.get('eid');
        
        if (!id) {
            return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 })
        }
        
        // Delete from doctor table first (due to foreign key)
        await db.query('DELETE FROM doctor WHERE doctor_id = ?', [id]);
        // Then delete from employee table
        await db.query('DELETE FROM employee WHERE eid = ?', [id]);
        
        return NextResponse.json({ success: true, message: 'Doctor deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 })
    }
}

