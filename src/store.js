import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import Toast from './components/Toast';
import BrandSplash from './components/BrandSplash';
import { localDay, localDateTime } from './data';
import { supabase } from './supabase';

// Context เดียวที่ถือ (1) navigator แบบ state เอง และ (2) ข้อมูลแอป
// ตอนนี้ข้อมูลอ่าน/เขียนจาก Supabase (PostgreSQL) จริง — ไม่ใช่ mock แล้ว
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// โครงว่างก่อนโหลดข้อมูลเสร็จ (กันหน้าจอ crash)
const EMPTY = {
  patient: null,
  caregiver: null,
  medication_records: [],
  medication_log: [],
  notifications: [],
  appointments: [],
  blood_pressure_logs: [],
  blood_sugar_logs: [],
  heart_rate_logs: [],
  emergency_contacts: [],
};

// แปลง timestamp จาก DB (ISO/UTC) -> รูปแบบท้องถิ่นที่หน้าจอใช้อยู่
const day = (v) => (v ? localDay(new Date(v)) : '');
const dateTime = (v) => (v ? localDateTime(new Date(v)) : '');

// สำหรับเวลานัดหมายที่ผู้ใช้ "พิมพ์เอง" (wall-clock) — เก็บเป็น UTC naive ใน DB
// ต้องอ่านกลับด้วย UTC components เพื่อให้ได้เวลาเดิมที่พิมพ์ (ไม่บวก +7)
const pad2 = (n) => String(n).padStart(2, '0');
const dateTimeWall = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};

export function AppProvider({ children }) {
  const [route, setRoute] = useState({ name: 'Login', params: {} });
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [patients, setPatients] = useState([]);           // รายชื่อผู้ป่วยทั้งหมด (R9)
  const [activePatientId, setActivePatientId] = useState(null);
  const activeRef = useRef(null);                          // เก็บ id ที่กำลังเลือกไว้อ่านใน loadAll
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, level = 'success') => {
    setToast({ message, level, key: Date.now() });
  }, []);

  // ----- โหลดข้อมูลของผู้ป่วยที่เลือก (รองรับหลายคน) -----
  const loadAll = useCallback(async (preferredId) => {
    try {
      setLoading(true);
      // 1) โหลดรายชื่อผู้ป่วยทั้งหมด + โปรไฟล์ผู้ดูแล
      const [pts, cgs] = await Promise.all([
        supabase.from('patients').select('*').order('created_at'),
        supabase.from('caregivers').select('*').order('created_at').limit(1),
      ]);
      if (pts.error) throw pts.error;
      if (cgs.error) throw cgs.error;
      const list = pts.data || [];

      // 2) เลือกผู้ป่วยที่จะแสดง (ใช้ที่ส่งมา > ที่เลือกไว้ > คนแรก)
      const has = (id) => id && list.some((p) => p.id === id);
      const activeId = has(preferredId) ? preferredId : (has(activeRef.current) ? activeRef.current : (list[0] ? list[0].id : null));

      // 3) โหลดข้อมูลย่อยเฉพาะของผู้ป่วยคนนั้น
      const [meds, logs, notis, appts, bp, sugar, hr, contacts] = await Promise.all([
        supabase.from('medication_records').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('medication_log').select('*').eq('patient_id', activeId).order('taken_at'),
        supabase.from('medication_notifications').select('*').eq('patient_id', activeId).order('time'),
        supabase.from('appointments').select('*').eq('patient_id', activeId).order('datetime'),
        supabase.from('blood_pressure_logs').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('blood_sugar_logs').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('heart_rate_logs').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('emergency_contacts').select('*').eq('patient_id', activeId).order('created_at'),
      ]);
      const err = meds.error || logs.error || notis.error || appts.error || bp.error || sugar.error || hr.error || contacts.error;
      if (err) throw err;

      setPatients(list);
      setActivePatientId(activeId);
      activeRef.current = activeId;
      setData({
        patient: list.find((p) => p.id === activeId) || null,
        caregiver: (cgs.data && cgs.data[0]) || null,
        medication_records: meds.data || [],
        medication_log: (logs.data || []).map((l) => ({ ...l, taken_at: dateTime(l.taken_at) })),
        notifications: notis.data || [],
        appointments: (appts.data || []).map((a) => ({ ...a, datetime: dateTimeWall(a.datetime) })),
        blood_pressure_logs: (bp.data || []).map((r) => ({ ...r, created_at: day(r.created_at) })),
        blood_sugar_logs: (sugar.data || []).map((r) => ({ ...r, created_at: day(r.created_at) })),
        heart_rate_logs: (hr.data || []).map((r) => ({ ...r, created_at: day(r.created_at) })),
        emergency_contacts: contacts.data || [],
      });
    } catch (e) {
      showToast('โหลดข้อมูลจากฐานข้อมูลไม่สำเร็จ: ' + (e.message || String(e)), 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // สลับผู้ป่วยที่กำลังดู
  const selectPatient = (id) => loadAll(id);

  // ----- navigation -----
  const navigate = useCallback(
    (name, params = {}) => {
      setHistory((h) => [...h, route]);
      setRoute({ name, params });
    },
    [route]
  );

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setRoute(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);

  const reset = useCallback((name, params = {}) => {
    setHistory([]);
    setRoute({ name, params });
  }, []);

  const patientId = data.patient && data.patient.id;

  // ----- data actions (เขียนลง Supabase แล้วอัปเดต state) -----
  const addBP = async (systolic, diastolic) => {
    const { data: row, error } = await supabase
      .from('blood_pressure_logs')
      .insert({ patient_id: patientId, systolic: Number(systolic), diastolic: Number(diastolic) })
      .select()
      .single();
    if (error) return showToast('บันทึกความดันไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({
      ...d,
      blood_pressure_logs: [...d.blood_pressure_logs, { ...row, created_at: day(row.created_at) }],
    }));
  };

  const addSugar = async (level) => {
    const { data: row, error } = await supabase
      .from('blood_sugar_logs')
      .insert({ patient_id: patientId, sugar_level: Number(level) })
      .select()
      .single();
    if (error) return showToast('บันทึกน้ำตาลไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({
      ...d,
      blood_sugar_logs: [...d.blood_sugar_logs, { ...row, created_at: day(row.created_at) }],
    }));
  };

  const addHeartRate = async (bpm) => {
    const { data: row, error } = await supabase
      .from('heart_rate_logs')
      .insert({ patient_id: patientId, bpm: Number(bpm) })
      .select()
      .single();
    if (error) return showToast('บันทึกหัวใจไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({
      ...d,
      heart_rate_logs: [...d.heart_rate_logs, { ...row, created_at: day(row.created_at) }],
    }));
  };

  const updateCaregiver = async (patch) => {
    const cgId = data.caregiver && data.caregiver.id;
    if (!cgId) return showToast('ยังไม่มีโปรไฟล์ผู้ดูแล', 'warning');
    const { data: row, error } = await supabase
      .from('caregivers')
      .update(patch)
      .eq('id', cgId)
      .select()
      .single();
    if (error) return showToast('บันทึกข้อมูลผู้ดูแลไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({ ...d, caregiver: { ...d.caregiver, ...row } }));
  };

  const takeMed = async (med) => {
    const { data: row, error } = await supabase
      .from('medication_log')
      .insert({
        patient_id: patientId,
        medication_record_id: med.id,
        medication_name: med.medication_name,
      })
      .select()
      .single();
    if (error) return showToast('บันทึกการทานยาไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({
      ...d,
      medication_log: [...d.medication_log, { ...row, taken_at: dateTime(row.taken_at) }],
    }));
  };

  const addMedication = async (rec) => {
    const { data: row, error } = await supabase
      .from('medication_records')
      .insert({ patient_id: patientId, ...rec })
      .select()
      .single();
    if (error) return showToast('เพิ่มแผนยาไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({ ...d, medication_records: [...d.medication_records, row] }));
  };

  const addAppointment = async (ap) => {
    const { data: row, error } = await supabase
      .from('appointments')
      .insert({ patient_id: patientId, ...ap })
      .select()
      .single();
    if (error) return showToast('บันทึกนัดหมายไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({
      ...d,
      appointments: [...d.appointments, { ...row, datetime: dateTimeWall(row.datetime) }],
    }));
  };

  const addNotification = async (n) => {
    const { data: row, error } = await supabase
      .from('medication_notifications')
      .insert({ patient_id: patientId, ...n })
      .select()
      .single();
    if (error) return showToast('ตั้งแจ้งเตือนไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({ ...d, notifications: [...d.notifications, row] }));
  };

  const addEmergencyContact = async (c) => {
    const { data: row, error } = await supabase
      .from('emergency_contacts')
      .insert({ patient_id: patientId, ...c })
      .select()
      .single();
    if (error) return showToast('เพิ่มผู้ติดต่อไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({ ...d, emergency_contacts: [...d.emergency_contacts, row] }));
    showToast('เพิ่มผู้ติดต่อฉุกเฉินแล้ว', 'success');
  };

  // ลบข้อมูลทั่วไป: ระบุชื่อตาราง + id + key ใน state
  const removeItem = async (table, id, key) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return showToast('ลบไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) }));
    showToast('ลบแล้ว', 'success');
  };

  // เพิ่มผู้ป่วยใหม่ แล้วสลับไปดูคนนั้น (R9)
  const addPatient = async (rec) => {
    const { data: row, error } = await supabase
      .from('patients')
      .insert(rec)
      .select()
      .single();
    if (error) return showToast('เพิ่มผู้ป่วยไม่สำเร็จ: ' + error.message, 'danger');
    await loadAll(row.id);
    showToast('เพิ่มผู้ป่วยใหม่แล้ว', 'success');
  };

  const updatePatient = async (patch) => {
    if (!patientId) return showToast('ยังไม่มีข้อมูลผู้ป่วยให้แก้ไข', 'warning');
    const { data: row, error } = await supabase
      .from('patients')
      .update(patch)
      .eq('id', patientId)
      .select()
      .single();
    if (error) return showToast('บันทึกข้อมูลไม่สำเร็จ: ' + error.message, 'danger');
    setData((d) => ({ ...d, patient: { ...d.patient, ...row } }));
  };

  const value = {
    route,
    navigate,
    goBack,
    reset,
    user,
    setUser,
    data,
    patients,
    activePatientId,
    selectPatient,
    addPatient,
    loading,
    reloadAll: loadAll,
    addBP,
    addSugar,
    addHeartRate,
    updateCaregiver,
    takeMed,
    addMedication,
    addAppointment,
    addNotification,
    addEmergencyContact,
    removeItem,
    updatePatient,
    showToast,
  };

  return (
    <AppContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {loading ? <BrandSplash /> : children}
        <Toast data={toast} onHide={() => setToast(null)} />
      </View>
    </AppContext.Provider>
  );
}
