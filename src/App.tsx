import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  UsersRound, 
  Settings, 
  Menu, 
  Bell,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CrmProvider, useCrm } from './lib/crmStore';

// Views
import Dashboard from './views/Dashboard';
import TrainingList from './views/TrainingList';
import CourseDetails from './views/CourseDetails';
import LessonViewer from './views/LessonViewer';
import QuizScreen from './views/QuizScreen';
import RecruitmentDashboard from './views/RecruitmentDashboard';
import CandidateList from './views/CandidateList';
import CandidateProfile from './views/CandidateProfile';

function BottomNav() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/training', label: 'Đào tạo', icon: GraduationCap },
    { path: '/recruitment', label: 'Tuyển dụng', icon: UsersRound },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant flex justify-around items-center h-16 px-2 pb-safe z-50 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all duration-200",
              isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <Icon className={cn("size-6", isActive && "fill-current")} />
            <span className={cn("text-[10px] font-medium mt-1")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function TopBar() {
  const { resetDemoData } = useCrm();

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm h-14 flex items-center justify-between px-4 w-full">
      <button className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
        <Menu className="size-6" />
      </button>
      <h1 className="text-headline-md font-bold text-primary truncate px-4">
        CRM Hệ Thống
      </h1>
      <button
        onClick={resetDemoData}
        title="Khôi phục dữ liệu demo"
        className="p-2 -mr-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative"
      >
        <Bell className="size-6" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
      </button>
    </header>
  );
}

function Sidebar() {
  const location = useLocation();
  const { currentUser } = useCrm();
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/training', label: 'Đào tạo', icon: GraduationCap },
    { path: '/recruitment', label: 'Tuyển dụng', icon: UsersRound },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-outline-variant py-6 z-40">
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-primary">CRM Hệ Thống</h2>
      </div>
      
      <div className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-primary-container text-on-primary-container font-semibold shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <Icon className={cn("size-5", isActive && "fill-current")} />
              <span className="text-sm">{item.label}</span>
              {isActive && <ChevronRight className="ml-auto size-4" />}
            </Link>
          );
        })}
      </div>

      <div className="px-6 mt-auto pt-6 border-t border-outline-variant">
        <div className="flex items-center gap-3">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT56xaYBgGZcjb4fjg3yVanYOGyDjC80pxXcg96gJc8MCS2SiFU6urI5Q9zsc9xrJBRkJea0u1MQqKFgandaC_hSz7eS5BvCk6UxeUaZtC2N2OTqfBhHnipmdEDbwmDsrFLRMiPxy_V6eypLT5s3IF1tqDmydlOGrqnXqSLkFc_26EK_xSfyteHFP0wue00kLbcoZhiHaXDn1cWB-RFsHVnOPWM-I5Lu6C0gAoy4oqC7V5qYJRLRFJcCxWtoo3oXgeOkzwc3pVQg"
            alt="User"
            className="size-10 rounded-full object-cover border border-outline-variant"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{currentUser.name}</p>
            <p className="text-xs text-on-surface-variant truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MainLayout({ children, hideNav = false }: { children: React.ReactNode, hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen", !hideNav && "md:ml-64")}>
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
    <CrmProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/training" element={<MainLayout><TrainingList /></MainLayout>} />
          <Route path="/training/:id" element={<MainLayout hideNav><CourseDetails /></MainLayout>} />
          <Route path="/training/:id/lesson/:lessonId" element={<LessonViewer />} />
          <Route path="/training/:id/quiz" element={<QuizScreen />} />
          <Route path="/recruitment" element={<MainLayout><RecruitmentDashboard /></MainLayout>} />
          <Route path="/recruitment/candidates" element={<MainLayout><CandidateList /></MainLayout>} />
          <Route path="/recruitment/candidate/:id" element={<MainLayout hideNav><CandidateProfile /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><div className="p-4">Cài đặt (Coming soon)</div></MainLayout>} />
        </Routes>
      </BrowserRouter>
    </CrmProvider>
  );
}
