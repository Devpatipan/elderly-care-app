import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import './src/fonts';
import { AppProvider, useApp } from './src/store';
import { ensurePermissions, attachSpeechListener } from './src/notifications';
import BrandSplash from './src/components/BrandSplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PatientInfoScreen from './src/screens/PatientInfoScreen';
import AddPatientScreen from './src/screens/AddPatientScreen';
import MedicationScreen from './src/screens/MedicationScreen';
import AppointmentScreen from './src/screens/AppointmentScreen';
import ReminderScreen from './src/screens/ReminderScreen';
import GraphScreen from './src/screens/GraphScreen';
import HealthScreen from './src/screens/HealthScreen';
import SOSScreen from './src/screens/SOSScreen';
import CaregiverScreen from './src/screens/CaregiverScreen';
import ReportScreen from './src/screens/ReportScreen';
import PatientListScreen from './src/screens/PatientListScreen';
import CaregiverHomeScreen from './src/screens/CaregiverHomeScreen';
import NotificationInboxScreen from './src/screens/NotificationInboxScreen';

const SCREENS = {
  Login: LoginScreen,
  Home: HomeScreen,
  PatientInfo: PatientInfoScreen,
  AddPatient: AddPatientScreen,
  Medication: MedicationScreen,
  Appointment: AppointmentScreen,
  Reminder: ReminderScreen,
  Graph: GraphScreen,
  Health: HealthScreen,
  SOS: SOSScreen,
  Caregiver: CaregiverScreen,
  Report: ReportScreen,
  PatientList: PatientListScreen,
  CaregiverHome: CaregiverHomeScreen,
  NotificationInbox: NotificationInboxScreen,
};

function Router() {
  const { route } = useApp();
  const Current = SCREENS[route.name] || LoginScreen;
  return <Current />;
}

export default function App() {
  // โหลดฟอนต์ TH SarabunPSK (ตัวเดียวกับในเอกสารปริญญานิพนธ์)
  // ไฟล์อยู่ที่ assets/fonts/ — ชื่อไม่มีเว้นวรรคเพื่อกัน Metro หาไฟล์ไม่เจอบนเนทีฟ
  const [fontsLoaded] = useFonts({
    THSarabun: require('./assets/fonts/THSarabunPSK.ttf'),
    THSarabunBold: require('./assets/fonts/THSarabunPSK-Bold.ttf'),
  });

  // ขอสิทธิ์แจ้งเตือน + ฟัง event เพื่ออ่านออกเสียงเมื่อแจ้งเตือนเด้ง
  useEffect(() => {
    ensurePermissions().catch(() => {});
    const sub = attachSpeechListener();
    return () => sub && sub.remove && sub.remove();
  }, []);

  if (!fontsLoaded) {
    return <BrandSplash />;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Router />
      </AppProvider>
    </SafeAreaProvider>
  );
}
