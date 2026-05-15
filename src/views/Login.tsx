import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Trees, UserRound } from 'lucide-react';
import { useAuth } from '../lib/authStore';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đăng nhập được.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf8ef] p-4 text-[#1b1c19] md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-lg border border-[#e5dfd2] bg-[#fffdf7] shadow-2xl shadow-[#4f6540]/10 md:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#4f6540] p-8 text-white lg:block">
          <img
            src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&h=1600&fit=crop"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#26331f]/95 via-[#4f6540]/86 to-[#c9823a]/54" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/85">
                <Trees className="size-3.5" />
                People Operations
              </div>
              <h1 className="mt-6 max-w-xl font-display text-6xl font-bold leading-[0.95] tracking-tight">
                XOXO CRM
              </h1>
              <p className="mt-5 max-w-md text-sm font-semibold leading-6 text-white/78">
                Quản lý đào tạo, tuyển dụng và chấm công trong một không gian làm việc thống nhất.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['LMS', 'Đào tạo'],
                ['HR', 'Tuyển dụng'],
                ['GPS', 'Chấm công'],
              ].map(([value, label]) => (
                <div key={value} className="rounded-lg border border-white/18 bg-white/12 p-3 backdrop-blur">
                  <p className="text-2xl font-bold leading-none">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 md:p-8">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-11 items-center justify-center rounded-md bg-[#4f6540] text-white">
                <Trees className="size-5" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold leading-none">XOXO CRM</h1>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#676b62]">People Operations</p>
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#4f6540]">Đăng nhập</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-[#1b1c19]">Chào mừng trở lại</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#444840]">
              Nhập email và mật khẩu được cấp để truy cập hệ thống.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#676b62]">Email</span>
                <div className="mt-2 flex h-12 items-center gap-3 rounded-md border border-[#e5dfd2] bg-white px-3 transition focus-within:border-[#4f6540] focus-within:ring-4 focus-within:ring-[#4f6540]/10">
                  <Mail className="size-4 text-[#4f6540]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="email@congty.com"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9a9f94]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#676b62]">Mật khẩu</span>
                <div className="mt-2 flex h-12 items-center gap-3 rounded-md border border-[#e5dfd2] bg-white px-3 transition focus-within:border-[#4f6540] focus-within:ring-4 focus-within:ring-[#4f6540]/10">
                  <LockKeyhole className="size-4 text-[#4f6540]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9a9f94]"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-[#676b62] transition hover:text-[#4f6540]">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-md border border-[#e4a37a] bg-[#fff0e2] px-3 py-3 text-sm font-bold text-[#c55d24]">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#4f6540] px-5 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-[#4f6540]/20 transition hover:bg-[#6b7f4e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <UserRound className="size-4" />
                {loading ? 'Đang đăng nhập' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
