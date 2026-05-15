import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  Search,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { appSupabase } from '../lib/supabase';
import { getTodayKey } from '../lib/attendanceService';
import { cn } from '../lib/utils';

interface AttendanceUser {
  id: string;
  email: string;
  name: string;
  role: string | null;
  department: string | null;
  employee_code: string | null;
  timekeeping_code: string | null;
  status: string | null;
}

interface ShiftGroup {
  id: string;
  name: string;
  time: string;
  employees: AttendanceUser[];
}

interface TimesheetRecord {
  id: string;
  user_id: string;
  shift_id: string | null;
  schedule_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
}

interface ShiftRow {
  id: string;
  name?: string | null;
  shift_name?: string | null;
  code?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
}

const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function monthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start,
    end,
    startKey: getTodayKey(start),
    endKey: getTodayKey(end),
  };
}

function monthDays(date: Date) {
  const { end } = monthBounds(date);
  return Array.from({ length: end.getDate() }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1));
}

function sameMonth(dateA: Date, dateB: Date) {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();
}

function userSearchText(user: AttendanceUser) {
  return [user.name, user.email, user.employee_code, user.timekeeping_code, user.department, user.role].filter(Boolean).join(' ').toLowerCase();
}

function shiftForUser(user: AttendanceUser) {
  const source = `${user.role || ''} ${user.department || ''}`.toLowerCase();
  if (source.includes('sale') || source.includes('kinh doanh')) {
    return { id: 'sale', name: 'CA SALE', time: '09:00 - 21:00' };
  }
  if (source.includes('tech') || source.includes('kỹ thuật') || source.includes('ky thuat')) {
    return { id: 'technical', name: 'CA KỸ THUẬT', time: '08:00 - 17:30' };
  }
  return { id: 'office', name: 'CA VĂN PHÒNG', time: '08:00 - 17:30' };
}

function formatShiftTime(shift: ShiftRow) {
  const start = shift.start_time || shift.scheduled_start;
  const end = shift.end_time || shift.scheduled_end;
  if (!start || !end) return '';
  return `${String(start).slice(0, 5)} - ${String(end).slice(0, 5)}`;
}

function shiftFromRow(shift: ShiftRow) {
  return {
    id: shift.id,
    name: shift.name || shift.shift_name || shift.code || 'CA LÀM VIỆC',
    time: formatShiftTime(shift) || 'Theo lịch phân ca',
  };
}

function groupUsersByShift(users: AttendanceUser[], records: TimesheetRecord[], shifts: ShiftRow[]) {
  const map = new Map<string, ShiftGroup>();
  const shiftMap = new Map(shifts.map((shift) => [shift.id, shiftFromRow(shift)]));

  users.forEach((user) => {
    const userShiftId = records.find((record) => record.user_id === user.id)?.shift_id;
    const shift = userShiftId && shiftMap.has(userShiftId)
      ? shiftMap.get(userShiftId)!
      : shiftForUser(user);
    const current = map.get(shift.id) || { ...shift, employees: [] };
    current.employees.push(user);
    map.set(shift.id, current);
  });

  return Array.from(map.values()).sort((a, b) => {
    const order = ['sale', 'technical', 'office'];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });
}

function recordKey(employeeId: string, date: string) {
  return `${employeeId}__${date}`;
}

function formatMonth(date: Date) {
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function shortName(name: string) {
  return name;
}

export default function Attendance() {
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [records, setRecords] = useState<TimesheetRecord[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'shift' | 'employee'>('shift');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const range = monthBounds(selectedMonth);
        const [timesheetsResult, shiftsResult, usersResult] = await Promise.all([
          appSupabase
            ? appSupabase
              .from('timesheets')
              .select('id,user_id,shift_id,schedule_date,check_in,check_out,status')
              .gte('schedule_date', range.startKey)
              .lte('schedule_date', range.endKey)
              .order('schedule_date', { ascending: true })
            : Promise.resolve({ data: [], error: new Error('Chưa cấu hình Supabase timesheets.') }),
          appSupabase
            ? appSupabase
              .from('shifts')
              .select('*')
            : Promise.resolve({ data: [], error: null }),
          appSupabase
            ? appSupabase
              .from('users')
              .select('id,email,name,role,department,employee_code,timekeeping_code,status')
              .order('name', { ascending: true })
            : Promise.resolve({ data: [], error: new Error('Chưa cấu hình Supabase users.') }),
        ]);

        if (cancelled) return;
        if (timesheetsResult.error) throw timesheetsResult.error;
        if (usersResult.error) throw usersResult.error;

        const timesheets = (timesheetsResult.data || []) as TimesheetRecord[];

        if (!timesheets.length) {
          const latestResult = appSupabase
            ? await appSupabase
              .from('timesheets')
              .select('schedule_date')
              .order('schedule_date', { ascending: false })
              .limit(1)
              .maybeSingle<{ schedule_date: string }>()
            : { data: null };
          if (!cancelled && latestResult.data?.schedule_date) {
            const latestDate = new Date(`${latestResult.data.schedule_date}T00:00:00`);
            if (!sameMonth(latestDate, selectedMonth)) {
              setSelectedMonth(latestDate);
              return;
            }
          }
        }

        setRecords(timesheets);
        setShifts(((shiftsResult.data || []) as ShiftRow[]));
        setUsers((usersResult.data || []) as AttendanceUser[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được dữ liệu chấm công.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  const days = useMemo(() => monthDays(selectedMonth), [selectedMonth]);
  const todayKey = getTodayKey();

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const scheduledUserIds = new Set(records.map((record) => record.user_id));
    const activeUsers = users.filter((user) => (!user.status || user.status === 'active') && scheduledUserIds.has(user.id));
    const sourceUsers = activeUsers.length ? activeUsers : users.filter((user) => !user.status || user.status === 'active');
    if (!normalized) return sourceUsers;
    return sourceUsers.filter((user) => userSearchText(user).includes(normalized));
  }, [query, records, users]);

  const groups = useMemo(() => groupUsersByShift(filteredUsers, records, shifts), [filteredUsers, records, shifts]);

  const recordMap = useMemo(() => {
    const map = new Map<string, TimesheetRecord>();
    records.forEach((record) => {
      map.set(recordKey(record.user_id, record.schedule_date), record);
    });
    return map;
  }, [records]);

  const monthLabel = formatMonth(selectedMonth);
  const checkedInCount = records.filter((record) => Boolean(record.check_in)).length;
  const uniqueEmployees = new Set(records.filter((record) => record.check_in).map((record) => record.user_id)).size;

  function findRecord(user: AttendanceUser, dateKey: string) {
    return recordMap.get(recordKey(user.id, dateKey));
  }

  function changeMonth(offset: number) {
    setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function renderCell(user: AttendanceUser, date: Date) {
    const dateKey = getTodayKey(date);
    const record = findRecord(user, dateKey);
    const isFuture = date.getTime() > new Date(`${todayKey}T23:59:59`).getTime();
    const isToday = dateKey === todayKey;

    if (record?.check_in) {
      return (
        <span
          title={`${user.name} - ${dateKey}`}
          className={cn(
            'mx-auto block size-2 rounded-full',
            record.check_out || record.status === 'on_time' ? 'bg-[#f47c20]' : 'bg-[#4f6540]',
          )}
        />
      );
    }

    if (isFuture) {
      return <span className="mx-auto block size-7 rounded bg-[#e6e6e8]" />;
    }

    return <span className={cn('mx-auto block size-1.5 rounded-full', isToday ? 'bg-[#d1d5db]' : 'bg-transparent')} />;
  }

  return (
    <div className="page-shell max-w-[1800px]">
      <section className="overflow-hidden rounded-lg border border-home-outline bg-home-surface shadow-sm shadow-home-primary/5">
        <div className="flex flex-col gap-3 border-b border-home-outline bg-[#fffdf7] p-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <h1 className="whitespace-nowrap text-sm font-black text-home-on-surface">Bảng chấm công</h1>

            <label className="relative w-full min-w-[240px] md:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-home-on-surface-variant" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm nhân viên"
                className="h-10 w-full rounded-md border border-home-outline bg-home-bg pl-9 pr-3 text-xs font-semibold outline-none transition focus:border-home-primary"
              />
            </label>

            <select className="h-10 rounded-md border border-home-outline bg-home-bg px-3 text-xs font-semibold text-home-on-surface-variant outline-none">
              <option>Theo tháng</option>
            </select>

            <div className="flex items-center gap-1">
              <button onClick={() => changeMonth(-1)} className="flex size-9 items-center justify-center rounded-md text-home-on-surface-variant hover:bg-home-bg">
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-32 text-center text-sm font-bold text-home-on-surface">{monthLabel}</span>
              <button onClick={() => changeMonth(1)} className="flex size-9 items-center justify-center rounded-md text-home-on-surface-variant hover:bg-home-bg">
                <ChevronRight className="size-4" />
              </button>
            </div>

            <button onClick={() => setSelectedMonth(new Date())} className="h-9 rounded-md border border-home-outline bg-home-bg px-3 text-xs font-bold text-home-on-surface-variant hover:border-home-primary hover:text-home-primary">
              Chọn
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border border-home-outline bg-home-bg px-3 py-2 text-xs font-semibold text-home-on-surface-variant sm:flex">
              <CalendarDays className="size-4 text-home-primary" />
              {uniqueEmployees} nhân viên • {checkedInCount} lượt chấm
            </div>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as 'shift' | 'employee')}
              className="h-10 rounded-md border border-home-outline bg-home-bg px-3 text-xs font-semibold text-home-on-surface-variant outline-none"
            >
              <option value="shift">Xem theo ca</option>
              <option value="employee">Xem theo nhân viên</option>
            </select>
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#f47c20] px-4 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-[#f47c20]/20">
              <CheckCircle2 className="size-4" />
              Duyệt chấm công
            </button>
            <button className="flex size-10 items-center justify-center rounded-md border border-home-outline bg-home-bg text-home-on-surface-variant hover:text-home-primary">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="border-b border-[#e4a37a] bg-[#fff0e2] px-4 py-3 text-sm font-bold text-[#c55d24]">
            {error}
          </div>
        )}

        <div className="overflow-auto">
          <table className="min-w-[1680px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#fbf8ef] text-[11px] font-bold text-home-on-surface-variant">
                <th className="sticky left-0 z-30 w-[180px] min-w-[180px] border-b border-r border-home-outline bg-[#fbf8ef] px-4 py-3 shadow-[8px_0_12px_-12px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-2">
                    Ca làm việc
                    <span className="flex size-4 items-center justify-center rounded-full border border-home-outline text-[11px]">+</span>
                  </div>
                </th>
                <th className="sticky left-[180px] z-30 w-[320px] min-w-[320px] border-b border-r border-home-outline bg-[#fbf8ef] px-4 py-3 shadow-[8px_0_12px_-12px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-2">
                    Nhân viên
                    <span className="flex size-4 items-center justify-center rounded-full border border-home-outline text-[11px]">+</span>
                  </div>
                </th>
                {days.map((day) => {
                  const dateKey = getTodayKey(day);
                  const isWeekend = day.getDay() === 0;
                  const isToday = dateKey === todayKey;
                  return (
                    <th key={dateKey} className="w-11 border-b border-r border-home-outline bg-[#fbf8ef] px-1 py-2 text-center">
                      <div className={cn('mx-auto flex size-9 flex-col items-center justify-center rounded-full text-[10px]', isToday && 'bg-[#1e9bff] text-white')}>
                        <span className={cn('font-black', isWeekend && !isToday ? 'text-[#e65f43]' : '')}>{dayLabels[day.getDay()]}</span>
                        <span className={cn('font-bold', isWeekend && !isToday ? 'text-[#e65f43]' : '')}>{String(day.getDate()).padStart(2, '0')}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={days.length + 2} className="px-4 py-10 text-center text-sm font-semibold text-home-on-surface-variant">
                    Đang tải bảng chấm công...
                  </td>
                </tr>
              )}

              {!loading && groups.map((group) => (
                group.employees.map((user, index) => (
                  <tr key={`${group.id}-${user.id}`} className="text-[11px] hover:bg-[#fbf8ef]/70">
                    {index === 0 && (
                      <td rowSpan={group.employees.length} className="sticky left-0 z-20 w-[180px] min-w-[180px] border-b border-r border-home-outline bg-white px-4 py-4 align-top shadow-[8px_0_12px_-12px_rgba(0,0,0,0.35)]">
                        <p className="font-black uppercase text-home-on-surface">{group.name}</p>
                        <p className="mt-1 text-[11px] font-semibold text-home-on-surface-variant">{group.time}</p>
                      </td>
                    )}
                    <td className="sticky left-[180px] z-20 w-[320px] min-w-[320px] border-b border-r border-home-outline bg-white px-4 py-3 shadow-[8px_0_12px_-12px_rgba(0,0,0,0.35)]">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f2ead9] text-home-primary">
                          <UserRound className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="whitespace-normal break-words font-black uppercase leading-4 text-home-on-surface" title={user.name}>{shortName(user.name)}</p>
                          <p className="truncate text-[10px] font-semibold text-home-on-surface-variant">{user.employee_code || user.timekeeping_code || user.email}</p>
                        </div>
                      </div>
                    </td>
                    {days.map((day) => {
                      const dateKey = getTodayKey(day);
                      const isCurrentMonth = sameMonth(day, selectedMonth);
                      return (
                        <td key={`${user.id}-${dateKey}`} className={cn('h-11 border-b border-r border-home-outline bg-white px-1 text-center', !isCurrentMonth && 'bg-home-bg')}>
                          {renderCell(user, day)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ))}

              {!loading && groups.length === 0 && (
                <tr>
                  <td colSpan={days.length + 2} className="px-4 py-10 text-center text-sm font-semibold text-home-on-surface-variant">
                    Không có nhân viên phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-home-outline px-4 py-3 text-[11px] font-semibold text-home-on-surface-variant">
          <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#f47c20]" /> Có dữ liệu timesheets</span>
          <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#4f6540]" /> Chưa check-out</span>
          <span className="inline-flex items-center gap-2"><span className="size-5 rounded bg-[#e6e6e8]" /> Chưa tới ngày</span>
          <span className="inline-flex items-center gap-2"><Clock3 className="size-3.5" /> Dữ liệu từ Supabase</span>
        </div>
      </section>
    </div>
  );
}
