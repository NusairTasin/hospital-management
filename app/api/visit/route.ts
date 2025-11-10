import { db } from "../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { PID, Doctor_ID, Description, Treatment_Date, Test_IDs, Medicine_IDs, OtherCharges } = body;
        
        // Find next available TID
        const [tidResult]: any = await db.query('SELECT COALESCE(MAX(TID), 0) + 1 as next_id FROM Treatment');
        const nextTID = tidResult[0].next_id;
        
        // Create treatment record
        await db.query(
            'INSERT INTO Treatment (TID, Description, Treatment_Date) VALUES (?, ?, ?)',
            [nextTID, Description, Treatment_Date || new Date().toISOString().split('T')[0]]
        );
        
        // Link patient to treatment
        await db.query('INSERT INTO Takes (PID, TID) VALUES (?, ?)', [PID, nextTID]);
        
        // Link doctor to treatment
        if (Doctor_ID) {
            await db.query('INSERT INTO Consults (Doctor_ID, TID) VALUES (?, ?)', [Doctor_ID, nextTID]);
        }
        
        // Link tests to treatment
        if (Test_IDs && Array.isArray(Test_IDs)) {
            for (const testId of Test_IDs) {
                if (testId) {
                    await db.query('INSERT INTO Had (TID, Test_ID) VALUES (?, ?)', [nextTID, testId]);
                }
            }
        }
        
        // Link medicines to treatment
        if (Medicine_IDs && Array.isArray(Medicine_IDs)) {
            for (const medId of Medicine_IDs) {
                if (medId) {
                    await db.query('INSERT INTO Takes_Medicine (TID, Medicine_ID) VALUES (?, ?)', [nextTID, medId]);
                }
            }
        }
        
        // Find next available Bill ID
        const [billIdResult]: any = await db.query('SELECT COALESCE(MAX(Bill_ID), 0) + 1 as next_id FROM Bill');
        const nextBillID = billIdResult[0].next_id;
        
        // Get doctor's visit fee
        let doctorCost = 0;
        if (Doctor_ID) {
            const [doctorRows]: any = await db.query('SELECT Visit_Fee FROM Doctor WHERE Doctor_ID = ?', [Doctor_ID]);
            if (doctorRows.length > 0) {
                doctorCost = doctorRows[0].Visit_Fee || 0;
            }
        }
        
        // Calculate total test cost
        let testCost = 0;
        if (Test_IDs && Test_IDs.length > 0) {
            const placeholders = Test_IDs.map(() => '?').join(',');
            const [testRows]: any = await db.query(
                `SELECT SUM(TestCost) as total FROM Test WHERE Test_ID IN (${placeholders})`,
                Test_IDs
            );
            testCost = testRows[0].total || 0;
        }
        
        // Calculate total medicine cost
        let medicineCost = 0;
        if (Medicine_IDs && Medicine_IDs.length > 0) {
            const placeholders = Medicine_IDs.map(() => '?').join(',');
            const [medRows]: any = await db.query(
                `SELECT SUM(Medicine_Cost) as total FROM Medicine WHERE Medicine_ID IN (${placeholders})`,
                Medicine_IDs
            );
            medicineCost = medRows[0].total || 0;
        }
        
        // Create bill
        await db.query(
            'INSERT INTO Bill (Bill_ID, PID, BillDate, OtherCharges, Medicine_Cost, Room_Cost, Doctor_Cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nextBillID, PID, new Date().toISOString().split('T')[0], OtherCharges || 0, medicineCost, 0, doctorCost]
        );
        
        return NextResponse.json({ 
            success: true, 
            message: 'Visit created successfully',
            TID: nextTID,
            Bill_ID: nextBillID,
            Total_Cost: doctorCost + testCost + medicineCost + (OtherCharges || 0)
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
    }
}

