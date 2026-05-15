import { supabase } from './supabase';

const EMPLOYEE_STORAGE_KEY = 'xoxo-attendance-employee';

export type AttendanceStatus = 'not_checked_in' | 'working' | 'checked_out';

export interface AttendanceDbRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  work_date: string;
  shift_name: string;
  scheduled_start: string;
  scheduled_end: string;
  check_in_at: string | null;
  check_out_at: string | null;
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_out_lat: number | null;
  check_out_lng: number | null;
  last_lat: number | null;
  last_lng: number | null;
  location_accuracy_m: number | null;
  location_captured_at: string | null;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeIdentity {
  id: string;
  name: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy: number | null;
  capturedAt: string;
}

const DEFAULT_SHIFT = {
  shift_name: 'Ca hành chính',
  scheduled_start: '08:00',
  scheduled_end: '17:30',
};

export function getStoredEmployee(): EmployeeIdentity | null {
  try {
    const stored = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (parsed?.id && parsed?.name) {
      return {
        id: String(parsed.id),
        name: String(parsed.name),
      };
    }
  } catch (error) {
    console.error('Failed to parse attendance employee:', error);
  }

  return null;
}

export function setStoredEmployee(employee: EmployeeIdentity) {
  const nextEmployee = {
    id: employee.id.trim(),
    name: employee.name.trim(),
  };

  if (!nextEmployee.id || !nextEmployee.name) {
    throw new Error('Vui lòng nhập mã nhân viên và tên.');
  }

  localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(nextEmployee));
  return nextEmployee;
}

export function clearStoredEmployee() {
  localStorage.removeItem(EMPLOYEE_STORAGE_KEY);
}

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthRange(date = new Date()) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    start: getTodayKey(startDate),
    end: getTodayKey(endDate),
  };
}

export function getBrowserLocation(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt không hỗ trợ GPS.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          capturedAt: new Date().toISOString(),
        });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Trình duyệt đang chặn quyền GPS. Hãy bật Location cho trang này rồi thử lại.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Không xác định được vị trí GPS hiện tại.'
              : error.code === error.TIMEOUT
                ? 'Lấy vị trí GPS quá lâu. Hãy thử lại.'
                : 'Không lấy được vị trí GPS.';

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 15_000,
      },
    );
  });
}

function assertSupabase() {
  if (!supabase) {
    throw new Error('Chưa cấu hình Supabase.');
  }

  return supabase;
}

export async function getTodayAttendance(employee: EmployeeIdentity) {
  const client = assertSupabase();

  const { data, error } = await client
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('work_date', getTodayKey())
    .maybeSingle();

  if (error) throw error;
  return data as AttendanceDbRecord | null;
}

export async function getAttendanceRecordsInRange(startDate: string, endDate: string) {
  const client = assertSupabase();

  const { data, error } = await client
    .from('attendance_records')
    .select('*')
    .gte('work_date', startDate)
    .lte('work_date', endDate)
    .order('work_date', { ascending: false })
    .order('employee_name', { ascending: true });

  if (error) throw error;
  return data as AttendanceDbRecord[];
}

export async function checkIn(employee: EmployeeIdentity, location: GeoPoint) {
  const client = assertSupabase();

  const { data, error } = await client
    .from('attendance_records')
    .upsert(
      {
        employee_id: employee.id,
        employee_name: employee.name,
        work_date: getTodayKey(),
        ...DEFAULT_SHIFT,
        check_in_at: new Date().toISOString(),
        check_in_lat: location.lat,
        check_in_lng: location.lng,
        last_lat: location.lat,
        last_lng: location.lng,
        location_accuracy_m: location.accuracy,
        location_captured_at: location.capturedAt,
        status: 'working',
      },
      { onConflict: 'employee_id,work_date' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return data as AttendanceDbRecord;
}

export async function checkOut(record: AttendanceDbRecord, location: GeoPoint) {
  const client = assertSupabase();

  const { data, error } = await client
    .from('attendance_records')
    .update({
      check_out_at: new Date().toISOString(),
      check_out_lat: location.lat,
      check_out_lng: location.lng,
      last_lat: location.lat,
      last_lng: location.lng,
      location_accuracy_m: location.accuracy,
      location_captured_at: location.capturedAt,
      status: 'checked_out',
    })
    .eq('id', record.id)
    .select('*')
    .single();

  if (error) throw error;
  return data as AttendanceDbRecord;
}

export async function saveTodayLocation(employee: EmployeeIdentity, location: GeoPoint) {
  const client = assertSupabase();
  const existing = await getTodayAttendance(employee);

  if (existing) {
    const { data, error } = await client
      .from('attendance_records')
      .update({
        last_lat: location.lat,
        last_lng: location.lng,
        location_accuracy_m: location.accuracy,
        location_captured_at: location.capturedAt,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw error;
    return data as AttendanceDbRecord;
  }

  const { data, error } = await client
    .from('attendance_records')
    .insert({
      employee_id: employee.id,
      employee_name: employee.name,
      work_date: getTodayKey(),
      ...DEFAULT_SHIFT,
      last_lat: location.lat,
      last_lng: location.lng,
      location_accuracy_m: location.accuracy,
      location_captured_at: location.capturedAt,
      status: 'not_checked_in',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as AttendanceDbRecord;
}
