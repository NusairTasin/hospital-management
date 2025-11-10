import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { db } from '@/app/lib/db'

async function getPatientDetails(pid: string) {
  try {
    // Get primary patient details
    const [patientRows]: any = await db.query('SELECT * FROM Patient WHERE PID = ?', [pid])
    if (patientRows.length === 0) {
      return null
    }
    const patient = patientRows[0]
    
    // Get phone numbers
    const [phoneRows]: any = await db.query('SELECT Phone_Number FROM Patient_Phone WHERE PID = ?', [pid])
    patient.Phone_Numbers = phoneRows.map((row: any) => row.Phone_Number)
    
    // Get treatments with doctor info
    const [treatmentRows]: any = await db.query(`
      SELECT t.TID, t.Description, t.Treatment_Date, d.Name as DoctorName
      FROM Treatment t
      JOIN Takes tk ON t.TID = tk.TID
      LEFT JOIN Consults c ON t.TID = c.TID
      LEFT JOIN Doctor doc ON c.Doctor_ID = doc.Doctor_ID
      LEFT JOIN Employee d ON doc.Doctor_ID = d.EID
      WHERE tk.PID = ?
    `, [pid])
    
    // Get tests and medicines for each treatment
    for (const treatment of treatmentRows) {
      const [testRows]: any = await db.query(`
        SELECT test.TestName, test.TestCost
        FROM Had h
        JOIN Test test ON h.Test_ID = test.Test_ID
        WHERE h.TID = ?
      `, [treatment.TID])
      treatment.Tests = testRows
      
      const [medicineRows]: any = await db.query(`
        SELECT m.Medicine_Name, m.Medicine_Cost
        FROM Takes_Medicine tm
        JOIN Medicine m ON tm.Medicine_ID = m.Medicine_ID
        WHERE tm.TID = ?
      `, [treatment.TID])
      treatment.Medicines = medicineRows
    }
    patient.Treatments = treatmentRows
    
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
    `, [pid])
    patient.Admissions = admissionRows
    
    // Get bills
    const [billRows]: any = await db.query('SELECT * FROM Bill WHERE PID = ?', [pid])
    patient.Bills = billRows
    
    return patient
  } catch (error) {
    console.error('Error fetching patient details:', error)
    return null
  }
}

export default async function PatientDetailsPage({ params }: { params: Promise<{ pid: string }> | { pid: string } }) {
  // Handle both Promise and direct params for compatibility
  const resolvedParams = params instanceof Promise ? await params : params
  const pid = resolvedParams.pid
  const patient = await getPatientDetails(pid)

  if (!patient) {
    return (
      <div className="p-6">
        <Link href="/dashboard/patient">
          <Button variant="outline">Back to Patients</Button>
        </Link>
        <div className="mt-4">
          <p>Patient not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link href="/dashboard/patient">
        <Button variant="outline" className="mb-4">Back to Patients</Button>
      </Link>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-4">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><strong>ID:</strong> {String(patient.PID || '')}</div>
            <div><strong>Name:</strong> {String(patient.Name || '')}</div>
            <div><strong>Gender:</strong> {String(patient.Gender || '')}</div>
            <div><strong>Birthdate:</strong> {patient.Birthdate ? (patient.Birthdate instanceof Date ? patient.Birthdate.toISOString().split('T')[0] : String(patient.Birthdate)) : 'N/A'}</div>
            <div><strong>Relative Number:</strong> {String(patient.Relative_Num || '')}</div>
            <div><strong>Address:</strong> {String(patient.Address || '')}</div>
            <div><strong>Phone Numbers:</strong> {patient.Phone_Numbers?.join(', ') || 'N/A'}</div>
          </div>
        </div>

        {patient.Treatments && patient.Treatments.length > 0 && (
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Treatments</h2>
            <div className="space-y-4">
              {patient.Treatments.map((treatment: any) => (
                <div key={treatment.TID} className="border-b pb-4">
                  <div><strong>Treatment ID:</strong> {String(treatment.TID || '')}</div>
                  <div><strong>Description:</strong> {String(treatment.Description || '')}</div>
                  <div><strong>Date:</strong> {treatment.Treatment_Date ? (treatment.Treatment_Date instanceof Date ? treatment.Treatment_Date.toISOString().split('T')[0] : String(treatment.Treatment_Date)) : 'N/A'}</div>
                  <div><strong>Doctor:</strong> {String(treatment.DoctorName || 'N/A')}</div>
                  {treatment.Tests && treatment.Tests.length > 0 && (
                    <div className="mt-2">
                      <strong>Tests:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {treatment.Tests.map((test: any, idx: number) => (
                          <li key={idx}>{test.TestName} - ${test.TestCost}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {treatment.Medicines && treatment.Medicines.length > 0 && (
                    <div className="mt-2">
                      <strong>Medicines:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {treatment.Medicines.map((med: any, idx: number) => (
                          <li key={idx}>{med.Medicine_Name} - ${med.Medicine_Cost}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {patient.Admissions && patient.Admissions.length > 0 && (
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Admissions</h2>
            <div className="space-y-4">
              {patient.Admissions.map((admission: any) => (
                <div key={admission.Admission_ID} className="border-b pb-4">
                  <div><strong>Admission ID:</strong> {String(admission.Admission_ID || '')}</div>
                  <div><strong>Admission Date:</strong> {admission.Admission_Date ? (admission.Admission_Date instanceof Date ? admission.Admission_Date.toISOString().split('T')[0] : String(admission.Admission_Date)) : 'N/A'}</div>
                  <div><strong>Discharge Date:</strong> {admission.Discharge_Date ? (admission.Discharge_Date instanceof Date ? admission.Discharge_Date.toISOString().split('T')[0] : String(admission.Discharge_Date)) : 'Not discharged'}</div>
                  <div><strong>Room:</strong> {String(admission.Room_ID || '')} - {String(admission.RoomType || '')} (${Number(admission.RoomCost || 0)}/day)</div>
                  <div><strong>Days:</strong> {String(admission.DaysCount || '')}</div>
                  <div><strong>Doctor:</strong> {String(admission.DoctorName || 'N/A')}</div>
                  <div><strong>Nurse:</strong> {String(admission.NurseName || 'N/A')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {patient.Bills && patient.Bills.length > 0 && (
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Bills</h2>
            <div className="space-y-4">
              {patient.Bills.map((bill: any) => (
                <div key={bill.Bill_ID} className="border-b pb-4">
                  <div><strong>Bill ID:</strong> {String(bill.Bill_ID || '')}</div>
                  <div><strong>Date:</strong> {bill.BillDate ? (bill.BillDate instanceof Date ? bill.BillDate.toISOString().split('T')[0] : String(bill.BillDate)) : 'N/A'}</div>
                  <div><strong>Doctor Cost:</strong> ${Number(bill.Doctor_Cost || 0)}</div>
                  <div><strong>Medicine Cost:</strong> ${Number(bill.Medicine_Cost || 0)}</div>
                  <div><strong>Room Cost:</strong> ${Number(bill.Room_Cost || 0)}</div>
                  <div><strong>Other Charges:</strong> ${Number(bill.OtherCharges || 0)}</div>
                  <div><strong>Total:</strong> ${Number(bill.Doctor_Cost || 0) + Number(bill.Medicine_Cost || 0) + Number(bill.Room_Cost || 0) + Number(bill.OtherCharges || 0)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

