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

const latestByPatient = (rows) =>
  (rows || []).reduce((acc, row) => {
    const prev = acc[row.patient_id];
    if (!prev || new Date(row.created_at) >= new Date(prev.created_at)) acc[row.patient_id] = row;
    return acc;
  }, {});

const authUserToAppUser = (authUser) => {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email,
    name: meta.name || meta.full_name || authUser.email,
    age: meta.age ?? null,
    phone: meta.phone || null,
  };
};

export function AppProvider({ children }) {
  const [route, setRoute] = useState({ name: 'Login', params: {} });
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [patients, setPatients] = useState([]);           // รายชื่อผู้ป่วยทั้งหมด (R9)
  const [patientSummaries, setPatientSummaries] = useState({});
  const [activePatientId, setActivePatientId] = useState(null);
  const activeRef = useRef(null);                          // เก็บ id ที่กำลังเลือกไว้อ่านใน loadAll
  const userRef = useRef(null);                            // id ผู้ดูแลที่ล็อกอิน (owner ของผู้ป่วย)
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, level = 'success') => {
    setToast({ message, level, key: Date.now() });
  }, []);

  // ----- โหลดข้อมูลของผู้ป่วยที่เลือก (รองรับหลายคน) -----
  const loadAll = useCallback(async (preferredId) => {
    try {
      setLoading(true);
      // ยังไม่ล็อกอิน (ไม่มีผู้ดูแล) — ไม่ต้องโหลดอะไร
      const ownerId = userRef.current;
      if (!ownerId) {
        setPatients([]);
        setPatientSummaries({});
        setActivePatientId(null);
        activeRef.current = null;
        setData(EMPTY);
        return;
      }
      // 1) โหลดผู้ป่วยเฉพาะของผู้ดูแลคนนี้
      const [pts] = await Promise.all([
        supabase.from('patients').select('*').eq('owner_id', ownerId).order('created_at'),
      ]);
      if (pts.error) throw pts.error;
      const list = pts.data || [];

      // 2) เลือกผู้ป่วยที่จะแสดง (ใช้ที่ส่งมา > ที่เลือกไว้ > คนแรก)
      const has = (id) => id && list.some((p) => p.id === id);
      const activeId = has(preferredId) ? preferredId : (has(activeRef.current) ? activeRef.current : (list[0] ? list[0].id : null));

      // ยังไม่มีผู้ป่วยเลย — ข้ามการ query ตารางย่อย (กัน eq patient_id=null ทำให้ uuid พัง)
      if (!activeId) {
        setPatients(list);
        setPatientSummaries({});
        setActivePatientId(null);
        activeRef.current = null;
        setData(EMPTY);
        return;
      }

      // 3) โหลดข้อมูลย่อยเฉพาะของผู้ป่วยคนนั้น
      const ids = list.map((p) => p.id);
      const [meds, logs, notis, appts, bp, sugar, hr, contacts, allBp, allSugar, allHr] = await Promise.all([
        supabase.from('medication_records').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('medication_log').select('*').eq('patient_id', activeId).order('taken_at'),
        supabase.from('medication_notifications').select('*').eq('patient_id', activeId).order('time'),
        supabase.from('appointments').select('*').eq('patient_id', activeId).order('datetime'),
        supabase.from('blood_pressure_logs').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('blood_sugar_logs').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('heart_rate_logs').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('emergency_contacts').select('*').eq('patient_id', activeId).order('created_at'),
        supabase.from('blood_pressure_logs').select('*').in('patient_id', ids).order('created_at'),
        supabase.from('blood_sugar_logs').select('*').in('patient_id', ids).order('created_at'),
        supabase.from('heart_rate_logs').select('*').in('patient_id', ids).order('created_at'),
      ]);
      const err = meds.error || logs.error || notis.error || appts.error || bp.error || sugar.error || hr.error || contacts.error || allBp.error || allSugar.error || allHr.error;
      if (err) throw err;

      const latestBp = latestByPatient(allBp.data);
      const latestSugar = latestByPatient(allSugar.data);
      const latestHr = latestByPatient(allHr.data);
      const summaries = Object.fromEntries(ids.map((id) => [
        id,
        {
          bp: latestBp[id] ? { ...latestBp[id], created_at: day(latestBp[id].created_at) } : null,
          sugar: latestSugar[id] ? { ...latestSugar[id], created_at: day(latestSugar[id].created_at) } : null,
          hr: latestHr[id] ? { ...latestHr[id], created_at: day(latestHr[id].created_at) } : null,
        },
      ]));

      setPatients(list);
      setPatientSummaries(summaries);
      setActivePatientId(activeId);
      activeRef.current = activeId;
      setData({
        patient: list.find((p) => p.id === activeId) || null,
        caregiver: null,
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

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      const appUser = authUserToAppUser(session && session.user);
      if (appUser) {
        setUser(appUser);
        userRef.current = appUser.id;
        reset('CaregiverHome');
      }
      await loadAll();
    };
    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const appUser = authUserToAppUser(session && session.user);
      setUser(appUser);
      userRef.current = appUser && appUser.id;
      if (!appUser) {
        setPatients([]);
        setPatientSummaries({});
        setActivePatientId(null);
        activeRef.current = null;
        setData(EMPTY);
        reset('Login');
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadAll, reset]);

  // ----- auth: เข้าสู่ระบบ/ออกจากระบบ (ผู้ดูแล) -----
  const signIn = useCallback((u) => {
    setUser(u);
    userRef.current = u && u.id;
    loadAll();               // โหลดผู้ป่วยของผู้ดูแลคนนี้
  }, [loadAll]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    userRef.current = null;
    setUser(null);
    setPatients([]);
    setPatientSummaries({});
    setActivePatientId(null);
    activeRef.current = null;
    setData(EMPTY);
    reset('Login');
  }, [reset]);

  const updateProfile = async (patch) => {
    const uid = userRef.current;
    if (!uid) return;
    const { data: authData, error } = await supabase.auth.updateUser({
      data: {
        name: patch.name ?? user?.name ?? null,
        age: patch.age ?? user?.age ?? null,
        phone: patch.phone ?? user?.phone ?? null,
      },
    });
    if (error) return showToast('บันทึกโปรไฟล์ไม่สำเร็จ: ' + error.message, 'danger');
    const u = authUserToAppUser(authData.user);
    if (u) setUser(u);
    showToast('บันทึกโปรไฟล์ผู้ดูแลแล้ว', 'success');
  };

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
    setPatientSummaries((s) => ({
      ...s,
      [patientId]: { ...(s[patientId] || {}), bp: { ...row, created_at: day(row.created_at) } },
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
    setPatientSummaries((s) => ({
      ...s,
      [patientId]: { ...(s[patientId] || {}), sugar: { ...row, created_at: day(row.created_at) } },
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
    setPatientSummaries((s) => ({
      ...s,
      [patientId]: { ...(s[patientId] || {}), hr: { ...row, created_at: day(row.created_at) } },
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

  // ดึงแจ้งเตือนยาของผู้ป่วย "ทุกคน" ของผู้ดูแล + ใส่ชื่อผู้ป่วยในข้อความ
  // ใช้ตอนเปิดแจ้งเตือนจริง: หลายคนทานพร้อมกัน = แจ้งแยกทีละคน (ข้อ 7)
  const getAllReminders = async () => {
    const ownerId = userRef.current;
    if (!ownerId) return [];
    const { data: pts } = await supabase.from('patients').select('id,name').eq('owner_id', ownerId);
    const list = pts || [];
    if (list.length === 0) return [];
    const ids = list.map((p) => p.id);
    const nameById = Object.fromEntries(list.map((p) => [p.id, p.name]));
    const { data: notis } = await supabase
      .from('medication_notifications')
      .select('*')
      .in('patient_id', ids)
      .order('time');
    return (notis || []).map((n) => ({
      ...n,
      message: `${nameById[n.patient_id] || 'ผู้ป่วย'}: ${n.message || 'ทานยา'}`,
    }));
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
      .insert({ ...rec, owner_id: userRef.current })
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
    signIn,
    signOut,
    updateProfile,
    data,
    patients,
    patientSummaries,
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
    getAllReminders,
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
