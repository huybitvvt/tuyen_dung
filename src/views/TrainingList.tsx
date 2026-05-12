import {
  BookOpen,
  Users,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Department, useCrm } from '../lib/crmStore';
import { useMemo, useState } from 'react';

export default function TrainingList() {
  const { courses, lessons, progress, enrollments, employees, currentUser, createCourse } = useCrm();
  const [departmentFilter, setDepartmentFilter] = useState<'all' | Department>('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const courseCards = useMemo(() => courses.map((course) => {
    const courseLessons = lessons.filter((lesson) => lesson.courseId === course.id);
    const courseProgress = courseLessons.map((lesson) => progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id)?.percent ?? 0);
    const progressPercent = courseProgress.length ? Math.round(courseProgress.reduce((sum, item) => sum + item, 0) / courseProgress.length) : 0;
    const enrollment = enrollments.find((item) => item.userId === currentUser.id && item.courseId === course.id);
    return {
      ...course,
      lessons: courseLessons.length,
      members: new Set(enrollments.filter((item) => item.courseId === course.id).map((item) => item.userId)).size,
      progress: progressPercent,
      status: enrollment?.status ?? 'chưa học',
    };
  }), [courses, lessons, progress, enrollments, currentUser.id]);

  const filteredCourses = courseCards.filter((course) => {
    const departmentMatch = departmentFilter === 'all' || course.department === departmentFilter;
    const levelMatch = levelFilter === 'all' || course.level === levelFilter;
    return departmentMatch && levelMatch;
  });

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
    <div className="relative min-h-screen px-4 py-8 md:px-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Đào tạo</h2>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">Theo dõi khóa học, gán nhân viên và kết quả quiz.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <Bell className="size-4 text-primary" />
            {courseCards.filter((course) => course.status !== 'hoàn thành').length} cần học
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value as 'all' | Department)}
            className="bg-surface border border-outline-variant rounded-lg text-sm font-medium py-2 px-3 outline-none focus:ring-1 focus:ring-primary h-10 min-w-max"
          >
            <option value="all">Tất cả phòng ban</option>
            <option value="Sale">Sale</option>
            <option value="Kỹ thuật">Kỹ thuật</option>
            <option value="Marketing">Marketing</option>
          </select>
          <select
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value)}
            className="bg-surface border border-outline-variant rounded-lg text-sm font-medium py-2 px-3 outline-none focus:ring-1 focus:ring-primary h-10 min-w-max"
          >
            <option value="all">Mọi cấp độ</option>
            <option value="Cơ bản">Cơ bản</option>
            <option value="Trung cấp">Trung cấp</option>
            <option value="Nâng cao">Nâng cao</option>
          </select>
          <button className="bg-surface border border-outline-variant rounded-lg text-sm font-medium py-2 px-3 flex items-center gap-2 h-10 hover:bg-surface-container-low transition-colors">
            <SlidersHorizontal className="size-4" /> Lọc
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredCourses.map((course) => {
          const isCompleted = course.status === 'hoàn thành';
          const statusClass = isCompleted
            ? 'text-on-surface-variant bg-surface-variant border-outline-variant'
            : course.status === 'đang học'
              ? 'text-[#137333] bg-[#e6f4ea] border-[#ceead6]'
              : 'text-primary bg-primary/10 border-primary/20';
          return (
            <Link
              key={course.id}
              to={`/training/${course.id}`}
              className={cn(
                'bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col hover:border-primary transition-all group',
                isCompleted && 'opacity-85'
              )}
            >
              <div className="h-28 relative bg-surface-container-high overflow-hidden">
                <div className={cn(
                  'w-full h-full opacity-90',
                  course.department === 'Sale' ? 'bg-gradient-to-r from-blue-100 to-sky-50' : course.department === 'Kỹ thuật' ? 'bg-gradient-to-r from-slate-200 to-cyan-50' : 'bg-gradient-to-r from-emerald-100 to-lime-50'
                )} />
                <div className={cn('absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border', statusClass)}>
                  {course.status}
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-surface-container-highest px-2 py-0.5 rounded">
                    {course.department}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-surface-container-highest px-2 py-0.5 rounded">
                    {course.level}
                  </span>
                  {course.kpiLeadEligible && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      KPI Lead
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                  {course.name}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{course.description}</p>

                <div className="flex items-center gap-6 text-on-surface-variant text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="size-4" /> {course.lessons} bài
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-4" /> {course.members} NV
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5 text-secondary">
                    <span>Tiến độ</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={cn('h-full rounded-full', isCompleted ? 'bg-[#137333]' : 'bg-primary-container')}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <button
        onClick={handleCreateCourse}
        title="Tạo khóa học"
        className="fixed bottom-[88px] right-6 p-4 bg-primary-container text-on-primary rounded-full shadow-lg shadow-primary/30 hover:bg-primary transition-all active:scale-95 z-40 group"
      >
        <Plus className="size-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}
