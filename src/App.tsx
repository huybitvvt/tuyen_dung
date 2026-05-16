import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  RotateCcw,
  Search,
  UsersRound,
  UserSquare2,
  X,
  KanbanSquare,
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

/* ─────────── Embed detection ───────────
 * Mặc định app CHẠY Ở DẠNG NHÚNG: ẩn sidebar/topbar/bottomnav, chỉ giữ menu con compact.
 * Đây là app dùng để nhúng vào host CRM khác.
 *
 * Để xem layout đầy đủ (có sidebar) cho mục đích phát triển, thêm ?standalone=1 vào URL.
 */
function detectEmbedMode(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const params = new URLSearchParams(window.location.search);
    const standalone = params.get('standalone') ?? params.get('full');
    if (standalone === '1' || standalone === 'true' || standalone === 'yes') return false;
    return true;
  } catch {
    return true;
  }
}

function useEmbedMode(): boolean {
  const [embed] = useState<boolean>(() => detectEmbedMode());
  useEffect(() => {
    if (embed) {
      document.documentElement.setAttribute('data-embed', '1');
    } else {
      document.documentElement.removeAttribute('data-embed');
    }
  }, [embed]);
  return embed;
}

type NavItem = {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  children?: { path: string; label: string; icon: typeof LayoutDashboard }[];
};

const navItems: NavItem[] = [
  { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
  {
    path: '/training',
    label: 'Đào tạo',
    icon: GraduationCap,
    children: [{ path: '/training', label: 'Danh sách khóa học', icon: GraduationCap }],
  },
  {
    path: '/recruitment',
    label: 'Tuyển dụng',
    icon: UsersRound,
    children: [
      { path: '/recruitment', label: 'Tổng quan tuyển dụng', icon: KanbanSquare },
      { path: '/recruitment/candidates', label: 'Ứng viên', icon: UserSquare2 },
      { path: '/recruitment/interview-questions', label: 'Bộ câu hỏi phỏng vấn', icon: MessageCircleQuestion },
    ],
  },
];

function isItemActive(itemPath: string, currentPath: string) {
  if (itemPath === '/') return currentPath === '/';
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
}

/* ─────────── DESKTOP SIDEBAR ─────────── */
function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { currentUser } = useCrm();
  const { user } = useAuth();
  const initials = (user?.name || currentUser.name).slice(0, 2).toUpperCase();

  // Auto-open groups containing the active route
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children && isItemActive(item.path, location.pathname)) {
        map[item.path] = true;
      }
    });
    return map;
  });

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      navItems.forEach((item) => {
        if (item.children && isItemActive(item.path, location.pathname)) {
          next[item.path] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  return (
    <aside className="flex h-full w-full flex-col bg-surface">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-outline-variant px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-sm shadow-primary/25">
          <span className="font-display text-[15px] font-bold leading-none">X</span>
        </div>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-bold leading-none tracking-[0.06em] text-on-surface">XOXO CRM</p>
          <p className="mt-0.5 text-[9.5px] font-black uppercase tracking-[0.18em] text-on-surface-variant">People Ops</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path, location.pathname);
          const hasChildren = !!item.children?.length;
          const isOpen = openGroups[item.path] ?? false;

          if (!hasChildren) {
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-bold transition',
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm shadow-primary/20'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          }

          return (
            <div key={item.path} className="mb-0.5">
              <button
                type="button"
                onClick={() => setOpenGroups((prev) => ({ ...prev, [item.path]: !isOpen }))}
                className={cn(
                  'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-bold transition',
                  isActive
                    ? 'bg-primary-fixed text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                <span className="flex-1 truncate text-left">{item.label}</span>
                <ChevronDown className={cn('size-4 shrink-0 transition-transform', isOpen && 'rotate-180')} strokeWidth={2.5} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-0.5 ml-3.5 space-y-0.5 border-l border-outline-variant pl-3">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive =
                          location.pathname === child.path ||
                          (child.path !== item.path && location.pathname.startsWith(child.path));
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={onNavigate}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-semibold transition',
                              childActive
                                ? 'bg-primary text-on-primary shadow-sm shadow-primary/20'
                                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                            )}
                          >
                            <ChildIcon className="size-3.5 shrink-0" strokeWidth={childActive ? 2.4 : 2} />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* User card */}
      <div className="border-t border-outline-variant p-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="size-9 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-[11px] font-black text-on-primary shadow-sm">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-black text-on-surface">{user?.name || currentUser.name}</p>
            <p className="truncate text-[10.5px] font-semibold text-on-surface-variant">{user?.role || currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─────────── DESKTOP TOP BAR ─────────── */
function DesktopTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { resetDemoData, currentUser } = useCrm();
  const { user, logout } = useAuth();
  const initials = (user?.name || currentUser.name).slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-outline-variant bg-surface/95 px-4 shadow-sm backdrop-blur-md md:px-5">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition active:scale-95 hover:bg-surface-container-low hover:text-primary lg:hidden"
        aria-label="Mở menu"
      >
        <Menu className="size-5" strokeWidth={2.2} />
      </button>

      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Tìm kiếm khóa học, ứng viên..."
          className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container-low pl-10 pr-3 text-[13px] font-semibold outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={resetDemoData}
          title="Khôi phục dữ liệu demo"
          className="hidden h-10 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 text-[11px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary md:inline-flex"
        >
          <RotateCcw className="size-3.5" strokeWidth={2.5} />
          Reset
        </button>

        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-xl text-on-surface-variant transition active:scale-95 hover:bg-surface-container-low hover:text-primary"
          aria-label="Thông báo"
        >
          <Bell className="size-5" strokeWidth={2.2} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#d45b37] ring-2 ring-surface" />
        </button>

        <div className="ml-1 flex items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-low/60 py-1.5 pl-1.5 pr-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="size-8 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-container text-[10px] font-black text-on-primary">
              {initials}
            </div>
          )}
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-[12px] font-black leading-none text-on-surface">{user?.name || currentUser.name}</p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-on-surface-variant">{user?.role || currentUser.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex size-10 items-center justify-center rounded-xl text-on-surface-variant transition active:scale-95 hover:bg-surface-container-low hover:text-primary"
          aria-label="Đăng xuất"
        >
          <LogOut className="size-5" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

/* ─────────── MOBILE TOP BAR ─────────── */
function MobileTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { resetDemoData, currentUser } = useCrm();
  const { user, logout } = useAuth();
  const initials = (user?.name || currentUser.name).slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-outline-variant bg-surface/95 px-3 shadow-sm backdrop-blur-md">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition active:scale-90 hover:bg-surface-container-low hover:text-primary"
        aria-label="Mở menu"
      >
        <Menu className="size-5" strokeWidth={2.2} />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="size-7 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-[9px] font-black text-on-primary">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-on-surface-variant">XOXO CRM</p>
          <p className="truncate text-[12px] font-black leading-tight text-on-surface">
            Chào, {(user?.name || currentUser.name).split(' ').slice(-1)[0]}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition active:scale-90 hover:bg-surface-container-low hover:text-primary"
          aria-label="Thông báo"
        >
          <Bell className="size-4" strokeWidth={2.2} />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#d45b37]" />
        </button>
        <button
          type="button"
          onClick={resetDemoData}
          className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition active:scale-90 hover:bg-surface-container-low hover:text-primary"
          aria-label="Reset"
        >
          <RotateCcw className="size-4" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition active:scale-90 hover:bg-surface-container-low hover:text-primary"
          aria-label="Đăng xuất"
        >
          <LogOut className="size-4" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

/* ─────────── BOTTOM NAV (mobile only) ─────────── */
function BottomNav() {
  const location = useLocation();
  const items = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/training', label: 'Đào tạo', icon: GraduationCap },
    { path: '/recruitment', label: 'Tuyển dụng', icon: UsersRound },
  ];

  return (
    <nav className="sticky bottom-0 z-20 flex h-14 items-center justify-around border-t border-outline-variant bg-surface/95 px-1 shadow-[0_-10px_24px_-18px_rgba(79,101,64,0.35)] backdrop-blur-md md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item.path, location.pathname);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex min-w-14 flex-col items-center justify-center rounded-lg px-2 py-1 transition active:scale-95',
              isActive
                ? 'bg-primary text-on-primary shadow-sm shadow-primary/25'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
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

/* ─────────── MOBILE DRAWER (sidebar slides in from left) ─────────── */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative h-full w-72 max-w-[85vw] border-r border-outline-variant bg-surface shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3.5 z-10 flex size-9 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition active:scale-90 hover:bg-surface-container-high hover:text-on-surface"
              aria-label="Đóng menu"
            >
              <X className="size-4" strokeWidth={2.5} />
            </button>
            <Sidebar onNavigate={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────── EMBED NAV (top-level + sub-items) ─────────── */
function EmbedNav() {
  const location = useLocation();

  // Find the parent nav group of the current route
  const activeGroup = navItems.find((item) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  });

  return (
    <div className="sticky top-0 z-30 border-b border-outline-variant bg-surface/95 backdrop-blur-md">
      {/* Hàng 1 — module chính */}
      <div className="px-3 pt-2.5 pb-2 md:px-5 md:pt-3 md:pb-2.5">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 scrollbar-hide snap-x">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeGroup?.path === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'shrink-0 snap-start inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition active:scale-95',
                  isActive
                    ? 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/25'
                    : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
                )}
              >
                <Icon className="size-3.5" strokeWidth={isActive ? 2.4 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Hàng 2 — sub-items của module hiện tại */}
      {activeGroup?.children?.length ? (
        <div className="border-t border-outline-variant/60 bg-surface-container-low/40 px-3 pt-2 pb-2 md:px-5 md:pb-2.5">
          <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 scrollbar-hide snap-x">
            <span className="shrink-0 text-[9.5px] font-black uppercase tracking-[0.16em] text-on-surface-variant">
              {activeGroup.label}
            </span>
            <span className="size-1 shrink-0 rounded-full bg-outline-variant" />
            {activeGroup.children.map((child) => {
              const ChildIcon = child.icon;
              const isActive =
                location.pathname === child.path ||
                (child.path !== activeGroup.path && location.pathname.startsWith(child.path + '/'));
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  className={cn(
                    'shrink-0 snap-start inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition active:scale-95',
                    isActive
                      ? 'border-primary/40 bg-primary-fixed text-primary shadow-sm'
                      : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
                  )}
                >
                  <ChildIcon className="size-3" strokeWidth={isActive ? 2.4 : 2} />
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─────────── MAIN LAYOUT (responsive + embed-aware) ─────────── */
function MainLayout({ children, hideNav = false }: { children: React.ReactNode; hideNav?: boolean }) {
  const location = useLocation();
  const embed = useEmbedMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // EMBED MODE — no sidebar/topbar/bottomnav, only content with full-width nav
  if (embed) {
    return (
      <div className="flex min-h-dvh flex-col bg-home-bg text-home-on-surface">
        <EmbedNav />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  if (hideNav) {
    // Standalone full-screen layout for course details / candidate profile / lessons
    return (
      <div className="min-h-dvh bg-home-bg text-home-on-surface">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-home-bg text-home-on-surface">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-outline-variant lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar varies by screen */}
        <div className="md:hidden">
          <MobileTopBar onMenuClick={() => setDrawerOpen(true)} />
        </div>
        <div className="hidden md:block">
          <DesktopTopBar onMenuClick={() => setDrawerOpen(true)} />
        </div>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav />
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
      <Route path="/recruitment/interview-questions" element={<MainLayout><InterviewQuestions /></MainLayout>} />
    </Routes>
  );
}
