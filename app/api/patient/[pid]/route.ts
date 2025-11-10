import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ pid: string }> }
) {
    try {
        const { pid } = await params;
        
        // Get primary patient details
        const [patientRows]: any = await db.query('SELECT * FROM Patient WHERE PID = ?', [pid]);
        if (patientRows.length === 0) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }
        const patient = patientRows[0];
        
        // Get phone numbers
        const [phoneRows]: any = await db.query('SELECT Phone_Number FROM Patient_Phone WHERE PID = ?', [pid]);
        patient.Phone_Numbers = phoneRows.map((row: any) => row.Phone_Number);
        
        // Get treatments with doctor info
        const [treatmentRows]: any = await db.query(`
            SELECT t.TID, t.Description, t.Treatment_Date, d.Name as DoctorName
            FROM Treatment t
            JOIN Takes tk ON t.TID = tk.TID
            LEFT JOIN Consults c ON t.TID = c.TID
            LEFT JOIN Doctor doc ON c.Doctor_ID = doc.Doctor_ID
            LEFT JOIN Employee d ON doc.Doctor_ID = d.EID
            WHERE tk.PID = ?
        `, [pid]);
        
        // Get tests and medicines for each treatment
        for (const treatment of treatmentRows) {
            const [testRows]: any = await db.query(`
                SELECT test.TestName, test.TestCost
                FROM Had h
                JOIN Test test ON h.Test_ID = test.Test_ID
                WHERE h.TID = ?
            `, [treatment.TID]);
            treatment.Tests = testRows;
            
            const [medicineRows]: any = await db.query(`
                SELECT m.Medicine_Name, m.Medicine_Cost
                FROM Takes_Medicine tm
                JOIN Medicine m ON tm.Medicine_ID = m.Medicine_ID
                WHERE tm.TID = ?
            `, [treatment.TID]);
            treatment.Medicines = medicineRows;
        }
        patient.Treatments = treatmentRows;
        
        // Get admission details
        const [admissionRows]: any = await db.query(`
            SELECT a.*, r.Room_ID, r.RoomType, r.RoomCost, al.DaysCount,
                   e1.Name as DoctorName, e2.Name as NurseName
            FROM Assigned_To at
            JOIN Admission a ON at.Admission_ID = a.Admission_ID
            LEFT JOIN Allocated al ON a.Admission_ID = al.Admission_ID
            LEFT JOIN Room r ON al.Room_ID = r.Room_ID
            LEFT JOIN Employee e1 ON at.Doctor_ID = e1.EID
            LEFT JOIN Employee e2 ON at.Nurse_ID = e2.EID
            WHERE at.PID = ?
        `, [pid]);
        patient.Admissions = admissionRows;
        
        // Get bills
        const [billRows]: any = await db.query('SELECT * FROM Bill WHERE PID = ?', [pid]);
        patient.Bills = billRows;
        
        return NextResponse.json(patient);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch patient details' }, { status: 500 });
    }
}

