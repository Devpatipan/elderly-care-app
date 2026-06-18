# สรุปงาน / Handoff — แอปดูแลผู้สูงอายุ (Elderly Care Assistant)

> ไฟล์นี้สรุปทุกอย่างของโปรเจกต์ ให้ session/ผู้พัฒนาใหม่อ่านไฟล์เดียวแล้วทำงานต่อได้ทันที

---

## 1. โปรเจกต์นี้คืออะไร

ต้นแบบ (prototype) แอปจากปริญญานิพนธ์ **"แอปพลิเคชันสำหรับผู้ดูแลผู้สูงอายุที่มีโรคประจำตัว"**
(ม.ราชภัฏสุรินทร์, วิทยาการคอมพิวเตอร์) — ช่วยผู้ดูแลบันทึก/ติดตามสุขภาพผู้สูงอายุที่เป็น
เบาหวาน / ความดัน / โรคหัวใจ

- เขียนด้วย **Expo (React Native + JavaScript)** — รันได้ทั้งมือถือ (สแกน QR ด้วย Expo Go) และเว็บ
- ข้อมูลเป็น **mock ในเครื่อง** (ยังไม่ต่อฐานข้อมูลจริง) ปิดแอปแล้วรีเซ็ต
- ตำแหน่งโปรเจกต์: `C:\Users\FAROKING\Desktop\Full-ball\elderly-care-app`

## 2. วิธีรัน

```
cd elderly-care-app
npm install
npx expo start -c      # -c = ล้าง cache (จำเป็นเวลาแก้ฟอนต์/asset)
```
- มือถือ: เปิดแอป **Expo Go** สแกน QR (มือถือ+คอมต้อง Wi-Fi เดียวกัน; ติดให้ใช้ `--tunnel`)
- เว็บ: กด `w` หรือเปิด `http://localhost:8081` (refresh ด้วย Ctrl+Shift+R)

## 3. โครงสร้างไฟล์

```
elderly-care-app/
├── App.js                 entry + โหลดฟอนต์ (useFonts) + router
├── index.js               registerRootComponent
├── app.json, package.json, babel.config.js
├── assets/fonts/          ไฟล์ฟอนต์ TH Sarabun (.ttf)  ← ผู้ใช้วางเอง
└── src/
    ├── theme.js           สี/ขนาด/เงา/spacing (โทน teal การแพทย์)
    ├── data.js            mock data (9 ตารางตามเอกสาร) + classifyBP/classifySugar
    ├── store.js           Context: navigation (state-based) + data actions + showToast + render <Toast>
    ├── fonts.js           บังคับใช้ฟอนต์ TH Sarabun ทั้งแอป (รายละเอียดข้อ 6)
    ├── components/
    │   ├── Screen.js       กรอบหน้า: header teal + แถบล่าง (Material icons) + FadeIn
    │   ├── ui.js           Card, SectionTitle, IconCircle, BigButton, Field, Badge,
    │   │                   ProgressBar, PressScale (กดย่อ), FadeIn (เลื่อนเข้า)
    │   └── Toast.js        toast แจ้งเตือนในแอป (แทน window.alert)
    └── screens/
        ├── LoginScreen.js         เข้าสู่ระบบ (mock, กดผ่านได้ทันที) — ภาพ 6
        ├── HomeScreen.js          dashboard: โปรไฟล์ + แถบความคืบหน้ายา + การ์ดสุขภาพ + เมนู — ภาพ 5
        ├── PatientInfoScreen.js   ข้อมูลผู้ป่วย — ภาพ 8
        ├── AddPatientScreen.js    เพิ่ม/แก้ไขข้อมูลผู้ป่วย — ภาพ 7
        ├── MedicationScreen.js    บันทึกการทานยา + ปุ่ม "ทานแล้ว" + ประวัติ — ภาพ 9
        ├── AppointmentScreen.js   นัดหมายแพทย์ — ภาพ 10
        ├── ReminderScreen.js      แจ้งเตือนทานยา — ภาพ 11
        ├── HealthScreen.js        บันทึกค่าความดัน/น้ำตาล + แปลผลทันที
        ├── GraphScreen.js         กราฟแท่งแนวโน้มสุขภาพ — ภาพ 12
        └── SOSScreen.js           โทรหาผู้ติดต่อฉุกเฉิน (เพิ่มจากเอกสาร)
```

## 4. ฟีเจอร์ที่ทำเสร็จแล้ว

- หน้าจอครบตาม mockup เอกสาร (ภาพ 5–12) + หน้า SOS และหน้าบันทึกค่าสุขภาพ
- Navigation แบบ state เอง (ไม่ใช้ react-navigation เพื่อลด dependency)
- ข้อมูล mock ตามดีไซน์ DB 9 ตารางในบทที่ 3
- แปลผลค่าสุขภาพอัตโนมัติตามเกณฑ์บทที่ 2 (ความดัน/น้ำตาล) + แถบเตือนหน้า Home
- แถบความคืบหน้าการทานยาวันนี้ (กด "ทานแล้ว" แล้วขยับ)
- Toast แจ้งเตือนในแอป (เขียว=สำเร็จ ส้ม=เตือน แดง=อันตราย)
- Animation: กดปุ่มย่อ (PressScale), เปลี่ยนหน้า fade (FadeIn), progress bar วิ่ง
- ไอคอน Material (`@expo/vector-icons` / MaterialCommunityIcons)
- ฟอนต์ TH Sarabun ทั้งแอป (ตัวปกติ + ตัวหนาของจริง)
- UI หลักการ 8-pt grid, 60/30/10, thumb-zone

## 5. ดีไซน์/ธีม
แก้สีทั้งแอปได้ที่ `src/theme.js` จุดเดียว — `primary` = teal `#0EA5A4`, accent = coral `#FF7A59`

## 6. เรื่องฟอนต์ TH Sarabun (สำคัญ — เคยมีปัญหา)

ต้องมีไฟล์ใน `assets/fonts/`:
- `THSarabun.ttf` (Regular)
- `THSarabun Bold.ttf` (Bold)  ← **ชื่อมีเว้นวรรค** (โค้ด App.js + src/fonts.js อ้างชื่อนี้)

วิธีทำงานของ `src/fonts.js`:
- **เว็บ:** ฉีด `@font-face` 2 อันใต้ชื่อเดียวกัน `THSarabun` แต่กำหนดช่วงน้ำหนัก
  `font-weight:100 500` (regular) และ `600 900` (bold) → เบราว์เซอร์เลือกไฟล์ตาม fontWeight เอง
- **เนทีฟ:** override `Text.render` แมป fontWeight ≥600 → family `THSarabunBold`
- ใช้ `defaultProps` ตั้ง family เริ่มต้นเป็น `THSarabun` ให้ทุก Text

**บทเรียนที่เจอมา:**
- ไฟล์ฟอนต์ฟอร์แมตเก่ามาก (รุ่นปี ~2549) บางตัวเบราว์เซอร์ **ปฏิเสธ (FontFace rejected)** → ตอนโหลดจะเห็น `[THSarabun] ... FAILED` ใน Console และ `document.fonts.check("16px THSarabun")` = `false`
- วิธีเช็ก: เปิด DevTools Console ดูข้อความ `[THSarabun] regular OK / bold OK`
- ถ้า FAILED: ให้แปลงไฟล์ผ่าน **transfonter.org** เป็น `.woff` แล้วปรับ path ในโค้ด (เว็บอ่าน woff ได้ชัวร์), หรือใช้ไฟล์รุ่นใหม่กว่า (เช่น TH Sarabun New / IT๙ ปี 2553)
- ⚠️ ถ้า Metro แดงว่าหาไฟล์ `THSarabun Bold.ttf` ไม่เจอ (เพราะชื่อมีเว้นวรรค) → เปลี่ยนชื่อไฟล์เป็น `THSarabunBold.ttf` แล้วแก้ path ใน `App.js` และ `src/fonts.js` ให้ตรง

## 7. สถานะล่าสุด / กำลังทำค้างไว้
- ฟอนต์: regular + bold โหลด OK บนเว็บแล้ว (เห็นหัวข้อหนา)
- ล่าสุดสลับ bold ไปใช้ไฟล์ปี 2549 (`THSarabun Bold.ttf`) ให้เข้าชุดกับ regular (ทรง PSK)
  → **ต้อง `npx expo start -c` แล้วเช็ก Console ว่า `bold OK`** ถ้า FAILED ใช้แนวทางข้อ 6

## 8. ข้อจำกัด / สิ่งที่ยังไม่ได้ทำ (งานพัฒนาต่อ)
- ยังเป็น mock data — **ยังไม่ต่อฐานข้อมูลจริง** (เอกสารระบุ MySQL; ทางเลือก: ต่อ API Node/Express + MySQL หรือใช้ Supabase)
- Login เป็นแบบจำลอง ยังไม่มี auth จริง
- แจ้งเตือนทานยา **ยังไม่เด้งตามเวลาจริง** — ต้องต่อ `expo-notifications`
- เสียงพูดแจ้งเตือน (เอกสารข้อ 3.3) ยังไม่ทำ — ต่อ `expo-speech` ได้
- กราฟเป็นกราฟแท่งวาดเอง ยังไม่ใช่กราฟเส้น 30 วันตามบทที่ 3
- รองรับผู้ป่วยคนเดียว (เอกสารระบุหลายคนได้) — ขยาย data.patient เป็น array ได้
- warning `shadow*`/touch ใน Console ไม่กระทบการใช้งาน (เป็นของ react-native-web)

## 9. ความต่างจากเอกสาร (รายละเอียดเต็มดู `DIFFERENCES.md`)
ทำตาม mockup ครบ + เพิ่ม: หน้า SOS โทรได้จริง, แถบเตือนค่าสุขภาพอัตโนมัติ, กราฟจริง,
ปุ่ม "ทานแล้ว" บันทึกประวัติ. ต่างโดยตั้งใจ: backend เป็น mock (เอกสาร=MySQL), ใช้ Expo แทน Android Studio

## 10. ทิป
- แก้ธีมทั้งแอป: `src/theme.js`
- เพิ่มข้อมูลตัวอย่าง: `src/data.js`
- เพิ่มหน้าใหม่: สร้างใน `src/screens/`, เพิ่มใน `SCREENS` ของ `App.js`, ลิงก์ด้วย `navigate('ชื่อ')`
- ทุกหน้าครอบด้วย `<Screen title="...">` เพื่อได้ header + แถบล่าง + animation อัตโนมัติ
