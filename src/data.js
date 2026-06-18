// ---------------------------------------------------------------------------
// Mock data modeled directly after the database design in บทที่ 3 of the thesis
// (tables: patients, medication_records, medication_log, medication_notifications,
//  appointments, blood_pressure_logs, blood_sugar_logs, emergency_contacts,
//  health_thresholds). No backend needed so the prototype runs instantly on scan.
// ---------------------------------------------------------------------------

let _id = 1000;
export const genId = () => ++_id;

// วันที่/เวลาแบบ "เวลาท้องถิ่น" (ไทย = UTC+7) — เลี่ยง toISOString ที่เป็น UTC
// ซึ่งทำให้ช่วงเช้าของไทยถูกนับเป็นวันก่อนหน้า ทำให้ "ทานยาวันนี้" ผิด
const _pad = (n) => String(n).padStart(2, '0');
export function localDay(d = new Date()) {
  return `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`;
}
export function localDateTime(d = new Date()) {
  return `${localDay(d)} ${_pad(d.getHours())}:${_pad(d.getMinutes())}`;
}

export const initialData = {
  // patients table (เอกสารใช้ทั้งชื่อ profiles/patients — รวมเป็นตารางเดียว)
  patient: {
    id: 'p1',
    name: 'สมหญิง ใจดี',
    age: 68,
    blood_type: 'O',
    weight: 62,
    height: 158,
    congenital_disease: 'เบาหวาน, ความดันโลหิตสูง',
    allergies: 'แพ้ยาเพนิซิลลิน',
    phone: '081-234-5678',
  },

  // medication_records (แผนการทานยา)
  medication_records: [
    {
      id: 'm1',
      medication_name: 'Metformin 500mg',
      dosage: '1 เม็ด',
      frequency: 'วันละ 2 ครั้ง',
      time_of_day: 'หลังอาหารเช้า-เย็น',
      notes: 'ยาเบาหวาน',
    },
    {
      id: 'm2',
      medication_name: 'Amlodipine 5mg',
      dosage: '1 เม็ด',
      frequency: 'วันละ 1 ครั้ง',
      time_of_day: 'หลังอาหารเช้า',
      notes: 'ยาความดัน',
    },
  ],

  // medication_log (ประวัติทานยาจริง)
  medication_log: [],

  // medication_notifications (การแจ้งเตือน)
  notifications: [
    { id: 'n1', med_id: 'm1', time: '07:30', repeat: 'ทุกวัน', message: 'ทาน Metformin 500mg' },
    { id: 'n2', med_id: 'm1', time: '16:30', repeat: 'ทุกวัน', message: 'ทาน Metformin 500mg' },
    { id: 'n3', med_id: 'm2', time: '07:30', repeat: 'ทุกวัน', message: 'ทาน Amlodipine 5mg' },
  ],

  // appointments (การนัดหมายแพทย์)
  appointments: [
    {
      id: 'a1',
      doctor_name: 'นพ. วิชัย รักษาดี',
      hospital_name: 'รพ.สุรินทร์',
      location: 'อาคารผู้ป่วยนอก ชั้น 3',
      datetime: '2026-06-25 09:00',
      notes: 'ตรวจระดับน้ำตาลสะสม (HbA1c)',
    },
  ],

  // blood_pressure_logs (บันทึกความดันโลหิต)
  blood_pressure_logs: [
    { id: 'bp1', systolic: 128, diastolic: 82, created_at: '2026-06-12' },
    { id: 'bp2', systolic: 135, diastolic: 85, created_at: '2026-06-14' },
    { id: 'bp3', systolic: 142, diastolic: 91, created_at: '2026-06-16' },
    { id: 'bp4', systolic: 138, diastolic: 88, created_at: '2026-06-18' },
  ],

  // blood_sugar_logs (บันทึกระดับน้ำตาล)
  blood_sugar_logs: [
    { id: 'bs1', sugar_level: 98, created_at: '2026-06-12' },
    { id: 'bs2', sugar_level: 115, created_at: '2026-06-14' },
    { id: 'bs3', sugar_level: 132, created_at: '2026-06-16' },
    { id: 'bs4', sugar_level: 120, created_at: '2026-06-18' },
  ],

  // emergency_contacts (ผู้ติดต่อฉุกเฉิน)
  emergency_contacts: [
    { id: 'e1', contact_name: 'สมชาย ใจดี', relationship: 'บุตร', phone_number: '0899991234' },
    { id: 'e2', contact_name: 'สายด่วนการแพทย์ฉุกเฉิน', relationship: 'หน่วยกู้ชีพ', phone_number: '1669' },
  ],
};

// ---------------------------------------------------------------------------
// health_thresholds logic — ค่าเกณฑ์มาตรฐานจากบทที่ 2 ของเอกสาร
// ใช้แปลผลค่าที่บันทึก แล้วเตือนผู้ดูแลอัตโนมัติ (ฟีเจอร์ที่เพิ่มจากเอกสาร)
// ---------------------------------------------------------------------------

// ความดันโลหิต (เกณฑ์ตามหัวข้อ 2.9.3)
export function classifyBP(systolic, diastolic) {
  const s = Number(systolic);
  const d = Number(diastolic);
  if (s >= 180 || d >= 110) return { label: 'สูงระดับ 3 (อันตราย)', level: 'danger' };
  if (s >= 160 || d >= 100) return { label: 'สูงระดับ 2', level: 'danger' };
  if (s >= 140 || d >= 90) return { label: 'สูงระดับ 1', level: 'warning' };
  if (s >= 130 || d >= 85) return { label: 'ค่อนข้างสูง', level: 'warning' };
  if (s >= 120 || d >= 80) return { label: 'ปกติ', level: 'success' };
  return { label: 'ดีมาก', level: 'success' };
}

// อัตราการเต้นของหัวใจ (bpm) — เกณฑ์ทั่วไปของผู้ใหญ่ขณะพัก 60–100
export function classifyHeartRate(bpm) {
  const v = Number(bpm);
  if (v >= 120) return { label: 'เต้นเร็วมาก', level: 'danger' };
  if (v > 100) return { label: 'เต้นเร็ว', level: 'warning' };
  if (v >= 60) return { label: 'ปกติ', level: 'success' };
  if (v >= 50) return { label: 'ค่อนข้างช้า', level: 'warning' };
  return { label: 'เต้นช้า', level: 'danger' };
}

// ระดับน้ำตาลในเลือด (เกณฑ์ตามหัวข้อ 2.8.4)
export function classifySugar(level) {
  const v = Number(level);
  if (v >= 126) return { label: 'เสี่ยงเป็นเบาหวาน', level: 'danger' };
  if (v >= 100) return { label: 'มีภาวะเสี่ยง', level: 'warning' };
  if (v >= 70) return { label: 'ปกติ', level: 'success' };
  return { label: 'ต่ำกว่าเกณฑ์', level: 'warning' };
}
