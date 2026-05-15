import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Bell,
  LayoutDashboard,
  GraduationCap,
  LogOut,
  UsersRound,
  Settings,
  RotateCcw,
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
import InterviewQuestions from './views/InterviewQuestions';

function BottomNav() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/training', label: 'Đào tạo', icon: GraduationCap },
    { path: '/recruitment', label: 'Tuyển dụng', icon: UsersRound },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <nav className="app-bottom-nav z-50 flex h-14 w-full items-center justify-around border-t border-home-outline bg-home-surface/95 px-1 backdrop-blur-md">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex min-w-14 flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-200 active:scale-95',
              isActive
                ? 'bg-home-primary text-white shadow-sm shadow-home-primary/25'
                : 'text-home-on-surface-variant hover:bg-home-bg hover:text-home-primary'
            )}
          >
            <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
            <span className="mt-0.5 text-[9px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function TopBar() {
  const { resetDemoData, currentUser } = useCrm();
  const { user, logout } = useAuth();
  const initials = (user?.name || currentUser.name).slice(0, 2).toUpperCase();

  return (
    <header className="app-top-bar z-50 flex h-12 w-full items-center justify-between gap-2 border-b border-home-outline bg-home-surface/95 px-3 shadow-sm backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2.5">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="size-8 shrink-0 rounded-full object-cover ring-2 ring-home-outline" />
        ) : (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-home-primary to-home-primary-light text-[10px] font-black text-white shadow-sm">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[9.5px] font-black uppercase tracking-[0.16em] text-home-on-surface-variant">XOXO CRM</p>
          <p className="truncate text-[12.5px] font-black leading-tight text-home-on-surface">
            Chào, {(user?.name || currentUser.name).split(' ').slice(-1)[0]}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full text-home-on-surface-variant transition active:scale-90 hover:bg-home-bg hover:text-home-primary"
          aria-label="Thông báo"
        >
          <Bell className="size-4.5" strokeWidth={2.2} />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#d45b37]" />
        </button>
        <button
          onClick={resetDemoData}
          title="Khôi phục dữ liệu demo"
          className="flex size-9 items-center justify-center rounded-full text-home-on-surface-variant transition active:scale-90 hover:bg-home-bg hover:text-home-primary"
          aria-label="Reset"
        >
          <RotateCcw className="size-4" strokeWidth={2.2} />
        </button>
        <button
          onClick={logout}
          className="flex size-9 items-center justify-center rounded-full text-home-on-surface-variant transition active:scale-90 hover:bg-home-bg hover:text-home-primary"
          aria-label="Đăng xuất"
        >
          <LogOut className="size-4" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

function MainLayout({ children, hideNav = false }: { children: React.ReactNode, hideNav?: boolean }) {
  return (
    <div className="app-stage">
      <div className="app-shell">
        {!hideNav && <TopBar />}
        <main className="app-main flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
      <Route path="/recruitment/interview-questions" element={<MainLayout hideNav><InterviewQuestions /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><div className="p-4">Cài đặt (Coming soon)</div></MainLayout>} />
    </Routes>
  );
}
