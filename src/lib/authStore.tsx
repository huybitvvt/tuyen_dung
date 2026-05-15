import { compare } from 'bcryptjs';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { appSupabase } from './supabase';

const AUTH_STORAGE_KEY = 'xoxo-crm-auth-user';
const URL_EMPLOYEE_KEYS = [
  'employee_code',
  'employeeCode',
  'ma_nhan_vien',
  'manv',
  'timekeeping_code',
  'code',
  'user_id',
  'userId',
  'uid',
  'email',
];

export interface AppUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string | null;
  department: string | null;
  status: string | null;
  employeeCode: string | null;
  timekeepingCode: string | null;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: string | null;
  department: string | null;
  status: string | null;
  employee_code: string | null;
  timekeeping_code: string | null;
}

interface AuthContextValue {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

function mapUser(row: UserRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name || row.email,
    phone: row.phone,
    avatar: row.avatar,
    role: row.role,
    department: row.department,
    status: row.status,
    employeeCode: row.employee_code,
    timekeepingCode: row.timekeeping_code,
  };
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) as AppUser : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getUrlEmployeeCode() {
  if (typeof window === 'undefined') return null;

  const searchParams = new URLSearchParams(window.location.search);
  const hashQuery = window.location.hash.includes('?')
    ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
    : '';
  const hashParams = new URLSearchParams(hashQuery);

  for (const key of URL_EMPLOYEE_KEYS) {
    const value = searchParams.get(key) || hashParams.get(key);
    if (value?.trim()) return value.trim();
  }

  return null;
}

async function findUserByField(field: keyof Pick<UserRow, 'id' | 'email' | 'employee_code' | 'timekeeping_code'>, value: string) {
  if (!appSupabase) return null;

  const query = appSupabase
    .from('users')
    .select('id,email,password_hash,name,phone,avatar,role,department,status,employee_code,timekeeping_code');

  const { data, error } = await (field === 'id' ? query.eq(field, value) : query.ilike(field, value))
    .limit(1)
    .maybeSingle<UserRow>();

  if (error) throw new Error(error.message);
  return data;
}

async function resolveUserFromUrlCode(code: string) {
  const fields: Array<keyof Pick<UserRow, 'id' | 'email' | 'employee_code' | 'timekeeping_code'>> = [
    'employee_code',
    'timekeeping_code',
    'id',
    'email',
  ];

  for (const field of fields) {
    const row = await findUserByField(field, code);
    if (row) return mapUser(row);
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(loadStoredUser);

  useEffect(() => {
    const code = getUrlEmployeeCode();
    if (!code) return;

    let cancelled = false;

    async function loadUrlUser() {
      try {
        const nextUser = await resolveUserFromUrlCode(code);
        if (cancelled || !nextUser) return;

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      } catch {
        if (!cancelled) setUser(null);
      }
    }

    void loadUrlUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password) {
      const normalizedEmail = email.trim();
      if (!normalizedEmail || !password) {
        throw new Error('Vui lòng nhập email và mật khẩu.');
      }

      if (!appSupabase) {
        throw new Error('Chưa cấu hình Supabase users.');
      }

      const { data, error } = await appSupabase
        .from('users')
        .select('id,email,password_hash,name,phone,avatar,role,department,status,employee_code,timekeeping_code')
        .ilike('email', normalizedEmail)
        .limit(1)
        .maybeSingle<UserRow>();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Email hoặc mật khẩu không đúng.');

      const isValid = await compare(password, data.password_hash);
      if (!isValid) throw new Error('Email hoặc mật khẩu không đúng.');

      const nextUser = mapUser(data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    },
    logout() {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
