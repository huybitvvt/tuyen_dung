import {
  Bell,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Plus,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Department, useCrm } from '../lib/crmStore';
import { useMemo, useState } from 'react';

export default function TrainingList() {
  const { courses, lessons, progress, enrollments, employees, currentUser, createCourse, quizzes, questions } = useCrm();
  const [departmentFilter, setDepartmentFilter] = useState<'all' | Department>('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const courseCards = useMemo(() => courses.map((course) => {
    const courseLessons = lessons.filter((lesson) => lesson.courseId === course.id);
    const courseProgress = courseLessons.map((lesson) => progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id)?.percent ?? 0);
    const progressPercent = courseProgress.length ? Math.round(courseProgress.reduce((sum, item) => sum + item, 0) / courseProgress.length) : 0;
    const enrollment = enrollments.find((item) => item.userId === currentUser.id && item.courseId === course.id);
    const quiz = quizzes.find((item) => item.courseId === course.id);
    return {
      ...course,
      lessons: courseLessons.length,
      videos: courseLessons.filter((lesson) => lesson.type === 'video').length,
      documents: courseLessons.filter((lesson) => lesson.type === 'document').length,
      members: new Set(enrollments.filter((item) => item.courseId === course.id).map((item) => item.userId)).size,
      questionCount: quiz ? questions.filter((item) => item.quizId === quiz.id).length : 0,
      progress: progressPercent,
      status: enrollment?.status ?? 'chưa học',
    };
  }), [courses, lessons, progress, enrollments, currentUser.id, quizzes, questions]);

  const filteredCourses = courseCards.filter((course) => {
    const departmentMatch = departmentFilter === 'all' || course.department === departmentFilter;
    const levelMatch = levelFilter === 'all' || course.level === levelFilter;
    return departmentMatch && levelMatch;
  });

  const pendingCount = courseCards.filter((course) => course.status !== 'hoàn thành').length;
  const averageProgress = courseCards.length ? Math.round(courseCards.reduce((sum, course) => sum + course.progress, 0) / courseCards.length) : 0;

  function handleCreateCourse() {
    const name = window.prompt('Tên khóa học mới');
    if (!name) return;
    const department = (window.prompt('Phòng ban: Sale / Kỹ thuật / Marketing', 'Sale') || 'Sale') as Department;
    const level = (window.prompt('Cấp độ: Cơ bản / Trung cấp / Nâng cao', 'Cơ bản') || 'Cơ bản') as 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
    createCourse({
      name,
      department,
      level,
      description: 'Khóa học mới cần bổ sung bài học và quiz.',
      assignedRoles: [department],
      assignedUsers: employees.filter((employee) => employee.department === department).map((employee) => employee.id),
      kpiLeadEligible: department === 'Sale',
    });
  }

  return (
    <div className="page-shell max-w-7xl">
      <section className="section-card p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-2">Training / LMS</p>
            <h1 className="text-3xl font-black text-on-surface">Đào tạo nội bộ</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-on-surface-variant">
              Quản lý khóa học theo phòng ban, theo dõi video/tài liệu, gán khóa cho nhân viên và đánh giá năng lực bằng quiz.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="eyebrow">Khóa</p>
              <p className="mt-2 text-2xl font-black">{courses.length}</p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="eyebrow">TB</p>
              <p className="mt-2 text-2xl font-black">{averageProgress}%</p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="eyebrow">Cần học</p>
              <p className="mt-2 text-2xl font-black">{pendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value as 'all' | Department)} className="h-10 min-w-max rounded-lg border border-outline-variant bg-surface px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">Tất cả phòng ban</option>
            <option value="Sale">Sale</option>
            <option value="Kỹ thuật">Kỹ thuật</option>
            <option value="Marketing">Marketing</option>
          </select>
          <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} className="h-10 min-w-max rounded-lg border border-outline-variant bg-surface px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">Mọi cấp độ</option>
            <option value="Cơ bản">Cơ bản</option>
            <option value="Trung cấp">Trung cấp</option>
            <option value="Nâng cao">Nâng cao</option>
          </select>
          <button className="btn-secondary">
            <SlidersHorizontal className="size-4" /> Lọc
          </button>
        </div>
        <button onClick={handleCreateCourse} className="btn-primary">
          <Plus className="size-4" />
          Tạo khóa học
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => {
          const isCompleted = course.status === 'hoàn thành';
          const statusClass = isCompleted
            ? 'border-secondary/30 bg-secondary-container text-on-secondary-container'
            : course.status === 'đang học'
              ? 'border-primary/25 bg-primary/10 text-primary'
              : 'border-tertiary/25 bg-amber-50 text-tertiary';
          return (
            <Link key={course.id} to={`/training/${course.id}`} className="section-card overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <div className={cn('h-2', course.department === 'Sale' ? 'bg-primary' : course.department === 'Kỹ thuật' ? 'bg-secondary' : 'bg-tertiary-container')} />
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="status-pill border-outline-variant bg-surface-container-low text-on-surface-variant">{course.department}</span>
                      <span className="status-pill border-outline-variant bg-surface-container-low text-on-surface-variant">{course.level}</span>
                    </div>
                    <h2 className="line-clamp-2 text-lg font-black leading-6 text-on-surface">{course.name}</h2>
                  </div>
                  <span className={cn('status-pill shrink-0', statusClass)}>{course.status}</span>
                </div>

                <p className="min-h-12 text-sm font-medium leading-6 text-on-surface-variant">{course.description}</p>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <BookOpen className="mb-2 size-4 text-primary" />
                    <p className="text-xs font-black">{course.lessons}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant">Bài học</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <Users className="mb-2 size-4 text-secondary" />
                    <p className="text-xs font-black">{course.members}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant">Nhân viên</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <FileQuestion className="mb-2 size-4 text-tertiary" />
                    <p className="text-xs font-black">{course.questionCount}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant">Câu hỏi</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between">
                    <span className="eyebrow">Tiến độ</span>
                    <span className="font-mono text-xs font-black text-on-surface">{course.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} transition={{ duration: 0.8 }} className={cn('h-full rounded-full', isCompleted ? 'bg-secondary' : 'bg-primary')} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-outline-variant/60 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                    {isCompleted ? <CheckCircle2 className="size-4 text-secondary" /> : <Bell className="size-4 text-tertiary" />}
                    {course.videos} video • {course.documents} tài liệu
                  </div>
                  {course.kpiLeadEligible && <span className="status-pill border-primary/20 bg-primary/10 text-primary">KPI lead</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
