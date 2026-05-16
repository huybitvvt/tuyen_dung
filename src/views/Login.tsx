import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
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
    <main className="min-h-dvh bg-home-bg p-4 text-on-surface md:p-6">
      <div className="mx-auto grid min-h-[calc(100dvh-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl shadow-primary/15 md:min-h-[calc(100dvh-3rem)] lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT — brand panel */}
        <section className="relative hidden overflow-hidden bg-primary p-8 text-white lg:block">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=1600&fit=crop"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c2348]/95 via-primary/85 to-tertiary/55" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                <Sparkles className="size-3.5" strokeWidth={2.5} />
                People Operations
              </div>
              <h1 className="mt-6 max-w-xl font-display text-6xl font-bold leading-[0.95] tracking-tight">
                XOXO CRM
              </h1>
              <p className="mt-5 max-w-md text-sm font-semibold leading-6 text-white/80">
                Quản lý đào tạo và tuyển dụng trong một không gian làm việc thống nhất.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['LMS', 'Đào tạo'],
                ['HR', 'Tuyển dụng'],
              ].map(([value, label]) => (
                <div key={value} className="rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur">
                  <p className="text-2xl font-bold leading-none">{value}</p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT — form */}
        <section className="flex items-center justify-center p-5 md:p-8">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-sm shadow-primary/25">
                <Sparkles className="size-5" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold leading-none text-on-surface">XOXO CRM</h1>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">People Operations</p>
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Đăng nhập</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-on-surface">Chào mừng trở lại</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-on-surface-variant">
              Nhập email và mật khẩu được cấp để truy cập hệ thống.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                  Email <span className="text-error">*</span>
                </span>
                <div className="mt-1.5 flex h-12 items-center gap-3 rounded-2xl border border-outline-variant bg-surface px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <Mail className="size-4 text-primary" strokeWidth={2.2} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="email@congty.com"
                    className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] font-bold outline-none placeholder:text-outline"
                  />
                </div>
              </label>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                    Mật khẩu <span className="text-error">*</span>
                  </span>
                  <a href="#" className="text-[11px] font-bold text-primary hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="mt-1.5 flex h-12 items-center gap-3 rounded-2xl border border-outline-variant bg-surface px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <LockKeyhole className="size-4 text-primary" strokeWidth={2.2} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••"
                    className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] font-bold outline-none placeholder:text-outline"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-on-surface-variant transition hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-error/30 bg-error-container px-3 py-3 text-[13px] font-bold text-on-error-container">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[12px] font-black uppercase tracking-[0.12em] text-on-primary shadow-md shadow-primary/25 transition active:scale-[0.99] hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
              >
                <UserRound className="size-4" strokeWidth={2.5} />
                {loading ? 'Đang đăng nhập' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
