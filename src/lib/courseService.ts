import { appSupabase } from './supabase';
import type { Course, Lesson, Progress, Quiz, Question, Result } from './crmStore';

// Course operations
export async function fetchCourses(): Promise<Course[]> {
  if (!appSupabase) {
    console.warn('Supabase not configured, using mock data');
    return [];
  }

  const { data, error } = await appSupabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    department: row.department,
    level: row.level,
    description: row.description || '',
    assignedRoles: row.assigned_roles || [],
    assignedUsers: row.assigned_users || [],
    kpiLeadEligible: row.kpi_lead_eligible || false,
  }));
}

export async function createCourse(course: Omit<Course, 'id'>): Promise<Course | null> {
  if (!appSupabase) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await appSupabase
    .from('courses')
    .insert({
      name: course.name,
      department: course.department,
      level: course.level,
      description: course.description,
      assigned_roles: course.assignedRoles,
      assigned_users: course.assignedUsers,
      kpi_lead_eligible: course.kpiLeadEligible,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating course:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    department: data.department,
    level: data.level,
    description: data.description || '',
    assignedRoles: data.assigned_roles || [],
    assignedUsers: data.assigned_users || [],
    kpiLeadEligible: data.kpi_lead_eligible || false,
  };
}

// Lesson operations
export async function fetchLessons(): Promise<Lesson[]> {
  if (!appSupabase) {
    console.warn('Supabase not configured, using mock data');
    return [];
  }

  const { data, error } = await appSupabase
    .from('lessons')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    type: row.type,
    contentUrl: row.content_url || '',
    videoUrl: row.video_url,
    duration: row.duration || 0,
    documentPages: row.document_pages,
  }));
}

export async function createLesson(lesson: Omit<Lesson, 'id'>): Promise<Lesson | null> {
  if (!appSupabase) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await appSupabase
    .from('lessons')
    .insert({
      course_id: lesson.courseId,
      title: lesson.title,
      type: lesson.type,
      content_url: lesson.contentUrl,
      video_url: lesson.videoUrl,
      duration: lesson.duration,
      document_pages: lesson.documentPages,
      order_index: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating lesson:', error);
    return null;
  }

  return {
    id: data.id,
    courseId: data.course_id,
    title: data.title,
    type: data.type,
    contentUrl: data.content_url || '',
    videoUrl: data.video_url,
    duration: data.duration || 0,
    documentPages: data.document_pages,
  };
}

// Progress operations
export async function fetchProgress(userId: string): Promise<Progress[]> {
  if (!appSupabase) {
    console.warn('Supabase not configured, using mock data');
    return [];
  }

  const { data, error } = await appSupabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching progress:', error);
    return [];
  }

  return (data || []).map((row) => ({
    userId: row.user_id,
    lessonId: row.lesson_id,
    percent: row.percent || 0,
    secondsWatched: row.seconds_watched || 0,
    completed: row.completed || false,
  }));
}

export async function upsertProgress(progress: Progress): Promise<boolean> {
  if (!appSupabase) {
    console.warn('Supabase not configured');
    return false;
  }

  const { error } = await appSupabase
    .from('lesson_progress')
    .upsert({
      user_id: progress.userId,
      lesson_id: progress.lessonId,
      percent: progress.percent,
      seconds_watched: progress.secondsWatched,
      completed: progress.completed,
    }, {
      onConflict: 'user_id,lesson_id'
    });

  if (error) {
    console.error('Error upserting progress:', error);
    return false;
  }

  return true;
}

// Quiz operations
export async function fetchQuizzes(): Promise<Quiz[]> {
  if (!appSupabase) {
    console.warn('Supabase not configured, using mock data');
    return [];
  }

  const { data, error } = await appSupabase
    .from('quizzes')
    .select('*');

  if (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    courseId: row.course_id,
  }));
}

export async function fetchQuestions(): Promise<Question[]> {
  if (!appSupabase) {
    console.warn('Supabase not configured, using mock data');
    return [];
  }

  const { data, error } = await appSupabase
    .from('questions')
    .select('*');

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    quizId: row.quiz_id,
    question: row.question,
    options: row.options || [],
    correctAnswer: row.correct_answer || 0,
  }));
}

export async function createResult(result: Omit<Result, 'id'>): Promise<Result | null> {
  if (!appSupabase) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await appSupabase
    .from('results')
    .insert({
      user_id: result.userId,
      quiz_id: result.quizId,
      score: result.score,
      passed: result.passed,
      submitted_at: result.submittedAt,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating result:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    quizId: data.quiz_id,
    score: data.score,
    passed: data.passed,
    submittedAt: data.submitted_at,
  };
}
