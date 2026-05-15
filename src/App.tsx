import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Bell,
  CalendarDays,
  LayoutDashboard, 
  GraduationCap, 
  LogOut,
  UsersRound, 
  Settings, 
  Menu, 
  ChevronRight,
  RotateCcw,
  Search,
  Fingerprint,
  Trees
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CrmProvider, useCrm } from './lib/crmStore';
import { AuthProvider, useAuth } from './lib/authStore';

// Views
import Dashboard from './views/Dashboard';
import TrainingList from './views/TrainingList';
import CourseDetails from './views/CourseDetails';
import LessonViewer from './views/LessonViewer';
import QuizScreen from './views/QuizScreen';
import RecruitmentDashboard from './views/RecruitmentDashboard';
import CandidateList from './views/CandidateList';
import CandidateProfile from './views/CandidateProfile';
import Attendance from './views/Attendance';
import Login from './views/Login';

function BottomNav() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/training', label: 'Đào tạo', icon: GraduationCap },
    { path: '/recruitment', label: 'Tuyển dụng', icon: UsersRound },
    { path: '/attendance', label: 'Chấm công', icon: Fingerprint },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-14 w-full items-center justify-around border-t border-home-outline bg-home-surface/95 px-1 backdrop-blur-md pb-safe md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex min-w-14 flex-col items-center justify-center px-2 py-1 rounded transition-all duration-200",
              isActive ? "bg-home-primary text-white shadow-sm" : "text-home-on-surface-variant hover:bg-home-bg hover:text-home-primary"
            )}
          >
            <Icon className="size-5" />
            <span className={cn("text-[9px] font-bold mt-0.5")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function TopBar() {
  const { resetDemoData, currentUser } = useCrm();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-home-outline bg-home-surface/90 px-3 shadow-sm backdrop-blur-md md:px-5">
      <div className="flex items-center gap-3 min-w-0">
        <button className="-ml-2 rounded-md p-2 text-home-on-surface-variant transition-colors hover:bg-home-bg md:hidden">
          <Menu className="size-5" />
        </button>
        <div className="min-w-0">
          <p className="eyebrow hidden sm:block">People Operations</p>
          <h1 className="truncate text-sm font-bold text-home-on-surface md:text-base">
            Dashboard quản lý nhân sự
          </h1>
        </div>
      </div>
      <div className="relative hidden w-[260px] lg:block">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-home-on-surface-variant" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="h-9 w-full rounded-md border border-home-outline bg-home-bg pl-9 pr-3 text-xs font-semibold outline-none transition focus:border-home-primary"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-home-outline bg-home-bg px-3 py-2 text-[11px] font-semibold text-home-on-surface-variant xl:flex">
          <CalendarDays className="size-3.5 text-home-primary" />
          30 ngày gần nhất
        </div>
        <button className="relative hidden text-home-on-surface-variant transition hover:text-home-primary sm:block">
          <Bell className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[#d45b37]" />
        </button>
        <button
          onClick={resetDemoData}
          title="Khôi phục dữ liệu demo"
          className="btn-secondary h-9 px-3"
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
        <div className="hidden items-center gap-2 rounded-md border border-home-outline bg-home-bg px-2 py-1.5 sm:flex">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="size-7 rounded-full object-cover" />
          ) : (
            <div className="flex size-7 items-center justify-center rounded-full bg-[#8f7a33] text-[10px] font-bold text-white">
              {(user?.name || currentUser.name).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="hidden min-w-0 lg:block">
            <p className="max-w-28 truncate text-xs font-bold text-home-on-surface">{user?.name || currentUser.name}</p>
            <p className="max-w-28 truncate text-[10px] text-home-on-surface-variant">{user?.role || currentUser.role}</p>
          </div>
          <button onClick={logout} className="rounded p-1 text-home-on-surface-variant transition hover:bg-white hover:text-home-primary" title="Đăng xuất">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  const location = useLocation();
  const { currentUser, courses, candidates } = useCrm();
  const { user } = useAuth();
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard, count: null },
    { path: '/training', label: 'Đào tạo', icon: GraduationCap, count: courses.length },
    { path: '/recruitment', label: 'Tuyển dụng', icon: UsersRound, count: candidates.length },
    { path: '/attendance', label: 'Chấm công', icon: Fingerprint, count: null },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[158px] flex-col border-r border-home-outline bg-home-surface md:flex">
      <div className="border-b border-home-outline px-5 py-5">
        <div>
          <h2 className="font-display text-[25px] font-bold leading-none tracking-[0.08em] text-home-on-surface">XOXO</h2>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-home-on-surface-variant">CRM</p>
        </div>
      </div>

      <div className="px-3 py-4">
        <div className="mb-3 rounded-lg border border-home-outline bg-[#fbf7eb] p-3 text-center">
          <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-md bg-[#f2ead9] text-home-primary">
            <Trees className="size-5" />
          </div>
          <p className="font-display text-[13px] font-bold">People Ops</p>
          <p className="mt-1 text-[9px] leading-3 text-home-on-surface-variant">Đào tạo, tuyển dụng và chấm công</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center gap-2.5 rounded px-2.5 py-2 text-[12px] font-semibold transition",
                isActive 
                  ? "bg-home-primary text-white shadow-sm" 
                  : "text-home-on-surface-variant hover:bg-home-bg hover:text-home-primary"
              )}
            >
              <Icon className="size-[15px]" />
              <span className="truncate">{item.label}</span>
              {item.count !== null && item.count !== undefined && (
                <span className={cn("ml-auto rounded px-1.5 py-0.5 text-[9px] font-black", isActive ? "bg-white/15 text-white" : "bg-home-bg text-home-on-surface-variant")}>
                  {item.count}
                </span>
              )}
              {isActive && <ChevronRight className={cn("size-3.5", item.count == null && "ml-auto")} />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-home-outline p-3">
        <div className="rounded-lg border border-home-outline bg-[#fbf7eb] p-3">
          <div className="mb-2 flex items-center gap-2">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="size-8 rounded-full object-cover" />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-[#8f7a33] text-[10px] font-bold text-white">
                {(user?.name || currentUser.name).slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-home-on-surface">{user?.name || currentUser.name}</p>
              <p className="truncate text-[10px] text-home-on-surface-variant">{user?.employeeCode || user?.department || currentUser.department}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MainLayout({ children, hideNav = false }: { children: React.ReactNode, hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-home-bg text-home-on-surface">
      <Sidebar />
      <div className={cn("flex min-h-screen flex-col", !hideNav && "md:ml-[158px]")}>
        {!hideNav && <TopBar />}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CrmProvider>
        <BrowserRouter>
          <AuthenticatedRoutes />
        </BrowserRouter>
      </CrmProvider>
    </AuthProvider>
  );
}

function AuthenticatedRoutes() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/training" element={<MainLayout><TrainingList /></MainLayout>} />
      <Route path="/training/:id" element={<MainLayout hideNav><CourseDetails /></MainLayout>} />
      <Route path="/training/:id/lesson/:lessonId" element={<LessonViewer />} />
      <Route path="/training/:id/quiz" element={<QuizScreen />} />
      <Route path="/recruitment" element={<MainLayout><RecruitmentDashboard /></MainLayout>} />
      <Route path="/recruitment/candidates" element={<MainLayout><CandidateList /></MainLayout>} />
      <Route path="/recruitment/candidate/:id" element={<MainLayout hideNav><CandidateProfile /></MainLayout>} />
      <Route path="/attendance" element={<MainLayout><Attendance /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><div className="p-4">Cài đặt (Coming soon)</div></MainLayout>} />
    </Routes>
  );
}
