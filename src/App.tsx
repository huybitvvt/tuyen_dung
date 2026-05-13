import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  UsersRound, 
  Settings, 
  Menu, 
  ChevronRight,
  RotateCcw,
  Sparkles
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
    <nav className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-outline-variant flex justify-around items-center h-14 px-1 pb-safe z-50 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex min-w-14 flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-200",
              isActive ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"
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

  return (
    <header className="sticky top-0 z-50 bg-surface/90 border-b border-outline-variant/80 shadow-sm backdrop-blur-md h-12 md:h-14 flex items-center justify-between px-3 md:px-5 w-full">
      <div className="flex items-center gap-3 min-w-0">
        <button className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors md:hidden">
          <Menu className="size-5" />
        </button>
        <div className="min-w-0">
          <p className="eyebrow hidden sm:block">XOXO CRM</p>
          <h1 className="text-sm font-black text-on-surface truncate md:text-base">
            Đào tạo & Tuyển dụng
          </h1>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant sm:flex">
        <Sparkles className="size-4 text-tertiary" />
        {currentUser.department} • {currentUser.role}
      </div>
      <button
        onClick={resetDemoData}
        title="Khôi phục dữ liệu demo"
        className="btn-secondary h-9 px-3"
      >
        <RotateCcw className="size-4" />
        <span className="hidden sm:inline">Reset demo</span>
      </button>
    </header>
  );
}

function Sidebar() {
  const location = useLocation();
  const { currentUser, courses, candidates } = useCrm();
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard, count: null },
    { path: '/training', label: 'Đào tạo', icon: GraduationCap, count: courses.length },
    { path: '/recruitment', label: 'Tuyển dụng', icon: UsersRound, count: candidates.length },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 bg-surface/95 border-r border-outline-variant/80 py-5 z-40 backdrop-blur-md">
      <div className="px-5 mb-7">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-on-primary font-black shadow-sm shadow-primary/20">
            XO
          </div>
          <div>
            <h2 className="text-base font-black text-on-surface">XOXO CRM</h2>
            <p className="eyebrow">People Ops</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-2.5 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-on-primary font-semibold shadow-sm shadow-primary/20" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <Icon className="size-4.5" />
              <span className="text-sm">{item.label}</span>
              {item.count !== null && item.count !== undefined && (
                <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-black", isActive ? "bg-white/15 text-white" : "bg-surface-container text-on-surface-variant")}>
                  {item.count}
                </span>
              )}
              {isActive && <ChevronRight className={cn("size-4", item.count == null && "ml-auto")} />}
            </Link>
          );
        })}
      </div>

      <div className="px-4 mt-auto pt-5 border-t border-outline-variant">
        <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT56xaYBgGZcjb4fjg3yVanYOGyDjC80pxXcg96gJc8MCS2SiFU6urI5Q9zsc9xrJBRkJea0u1MQqKFgandaC_hSz7eS5BvCk6UxeUaZtC2N2OTqfBhHnipmdEDbwmDsrFLRMiPxy_V6eypLT5s3IF1tqDmydlOGrqnXqSLkFc_26EK_xSfyteHFP0wue00kLbcoZhiHaXDn1cWB-RFsHVnOPWM-I5Lu6C0gAoy4oqC7V5qYJRLRFJcCxWtoo3oXgeOkzwc3pVQg"
            alt="User"
            className="size-10 rounded-lg object-cover border border-outline-variant"
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
      <div className={cn("flex flex-col min-h-screen", !hideNav && "md:ml-60")}>
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
