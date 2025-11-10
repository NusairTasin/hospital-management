import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const query = `
            SELECT p.PID, p.Name, p.Gender, p.Birthdate, p.Relative_Num, p.Address,
                   GROUP_CONCAT(DISTINCT pp.Phone_Number) as Phone_Number,
                   CASE WHEN MAX(a.Admission_ID) IS NOT NULL THEN 'Admitted' ELSE 'Outpatient' END as Status
            FROM Patient p
            LEFT JOIN Patient_Phone pp ON p.PID = pp.PID
            LEFT JOIN Assigned_To at ON p.PID = at.PID
            LEFT JOIN Admission a ON at.Admission_ID = a.Admission_ID
            GROUP BY p.PID, p.Name, p.Gender, p.Birthdate, p.Relative_Num, p.Address
        `;
        const [rows] = await db.query(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }
}

