import { appSupabase } from './supabase';

const EMPLOYEE_STORAGE_KEY = 'xoxo-attendance-employee';

export type AttendanceStatus = 'not_checked_in' | 'working' | 'checked_out';

export interface AttendanceDbRecord {
  id: string;
  user_id: string;
  schedule_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
  notes: string | null;
  shift?: AttendanceShift;
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_out_lat: number | null;
  check_out_lng: number | null;
  last_lat: number | null;
  last_lng: number | null;
  location_accuracy_m: number | null;
  location_captured_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeIdentity {
  id: string;
  name: string;
}

export interface AttendanceShift {
  id: string;
  name: string;
  time: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy: number | null;
  capturedAt: string;
}

interface TimesheetRow {
  id: string;
  user_id: string;
  shift_id: string | null;
  schedule_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface AttendanceNotes {
  attendanceShift?: AttendanceShift;
  checkInLocation?: GeoPoint;
  checkOutLocation?: GeoPoint;
  lastLocation?: GeoPoint;
}

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
  if (!appSupabase) {
    throw new Error('Chưa cấu hình Supabase.');
  }

  return appSupabase;
}

function parseNotes(notes: string | null): AttendanceNotes {
  if (!notes) return {};

  try {
    const parsed = JSON.parse(notes);
    return parsed && typeof parsed === 'object' ? parsed as AttendanceNotes : {};
  } catch {
    return {};
  }
}

function stringifyNotes(notes: AttendanceNotes) {
  return JSON.stringify(notes);
}

function mapTimesheet(row: TimesheetRow): AttendanceDbRecord {
  const notes = parseNotes(row.notes);
  const checkInLocation = notes.checkInLocation || null;
  const checkOutLocation = notes.checkOutLocation || null;
  const lastLocation = notes.lastLocation || checkOutLocation || checkInLocation;

  return {
    id: row.id,
    user_id: row.user_id,
    schedule_date: row.schedule_date,
    check_in: row.check_in,
    check_out: row.check_out,
    status: row.status,
    notes: row.notes,
    check_in_lat: checkInLocation?.lat ?? null,
    check_in_lng: checkInLocation?.lng ?? null,
    check_out_lat: checkOutLocation?.lat ?? null,
    check_out_lng: checkOutLocation?.lng ?? null,
    last_lat: lastLocation?.lat ?? null,
    last_lng: lastLocation?.lng ?? null,
    shift: notes.attendanceShift,
    location_accuracy_m: lastLocation?.accuracy ?? null,
    location_captured_at: lastLocation?.capturedAt ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getTodayAttendance(employee: EmployeeIdentity) {
  const client = assertSupabase();

  const { data, error } = await client
    .from('timesheets')
    .select('*')
    .eq('user_id', employee.id)
    .eq('schedule_date', getTodayKey())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTimesheet(data as TimesheetRow) : null;
}

export async function getAttendanceRecordsInRange(startDate: string, endDate: string) {
  const client = assertSupabase();

  const { data, error } = await client
    .from('timesheets')
    .select('*')
    .gte('schedule_date', startDate)
    .lte('schedule_date', endDate)
    .order('schedule_date', { ascending: false });

  if (error) throw error;
  return ((data || []) as TimesheetRow[]).map(mapTimesheet);
}

export async function checkIn(employee: EmployeeIdentity, location: GeoPoint, shift?: AttendanceShift) {
  const client = assertSupabase();
  const existing = await getTodayAttendance(employee);
  const notes = stringifyNotes({
    ...parseNotes(existing?.notes || null),
    ...(shift ? { attendanceShift: shift } : {}),
    checkInLocation: location,
    lastLocation: location,
  });

  if (existing) {
    const { data, error } = await client
      .from('timesheets')
      .update({
        check_in: existing.check_in || new Date().toISOString(),
        status: existing.check_out ? 'on_time' : 'incomplete',
        notes,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapTimesheet(data as TimesheetRow);
  }

  const { data, error } = await client
    .from('timesheets')
    .insert({
      user_id: employee.id,
      schedule_date: getTodayKey(),
      check_in: new Date().toISOString(),
      status: 'incomplete',
      notes,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapTimesheet(data as TimesheetRow);
}

export async function checkOut(record: AttendanceDbRecord, location: GeoPoint) {
  const client = assertSupabase();
  const notes = stringifyNotes({
    ...parseNotes(record.notes),
    checkOutLocation: location,
    lastLocation: location,
  });

  const { data, error } = await client
    .from('timesheets')
    .update({
      check_out: new Date().toISOString(),
      status: 'on_time',
      notes,
    })
    .eq('id', record.id)
    .select('*')
    .single();

  if (error) throw error;
  return mapTimesheet(data as TimesheetRow);
}

export async function saveTodayLocation(employee: EmployeeIdentity, location: GeoPoint) {
  const client = assertSupabase();
  const existing = await getTodayAttendance(employee);
  const notes = stringifyNotes({
    ...parseNotes(existing?.notes || null),
    lastLocation: location,
  });

  if (existing) {
    const { data, error } = await client
      .from('timesheets')
      .update({
        notes,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapTimesheet(data as TimesheetRow);
  }

  const { data, error } = await client
    .from('timesheets')
    .insert({
      user_id: employee.id,
      schedule_date: getTodayKey(),
      status: 'incomplete',
      notes,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapTimesheet(data as TimesheetRow);
}
