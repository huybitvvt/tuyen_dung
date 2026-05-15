# Hướng dẫn Setup Supabase

## 1. Cấu hình Supabase key

Ứng dụng dùng `@supabase/supabase-js` v2 và có thể kết nối bằng **publishable key** của Supabase.

Project hiện tại:

```env
VITE_APP_SUPABASE_URL="https://ljsdoeyiwlrvcqeyfkya.supabase.co"
VITE_APP_SUPABASE_ANON_KEY="sb_publishable_NDQm7ShVT_U_ZghQBE2RAg_ra8vke9j"
```

## 2. Cập nhật file .env.local

Đảm bảo file `.env.local` có đúng cấu hình:

```env
VITE_APP_SUPABASE_URL="https://ljsdoeyiwlrvcqeyfkya.supabase.co"
VITE_APP_SUPABASE_ANON_KEY="sb_publishable_NDQm7ShVT_U_ZghQBE2RAg_ra8vke9j"
```

## 3. Chạy SQL Schema

1. Vào Supabase Dashboard → **SQL Editor**
2. Copy toàn bộ nội dung file `supabase/schema.sql`
3. Paste vào SQL Editor và click **Run**

Schema sẽ tạo các bảng:
- ✅ `courses` - Khóa học
- ✅ `lessons` - Bài học (có trường video_url cho YouTube)
- ✅ `lesson_progress` - Tiến độ học
- ✅ `enrollments` - Ghi danh khóa học
- ✅ `quizzes` - Bài kiểm tra
- ✅ `questions` - Câu hỏi quiz
- ✅ `results` - Kết quả quiz
- ✅ `employees` - Nhân viên
- ✅ `recruitment_jobs` - Tin tuyển dụng
- ✅ `candidates` - Ứng viên
- ✅ `attendance_records` - Chấm công (đã có)

## 4. Seed Data (Optional)

Nếu muốn thêm dữ liệu mẫu, chạy SQL sau:

```sql
-- Insert sample employees
INSERT INTO employees (id, name, role, department) VALUES
('u1', 'Nguyễn Văn A', 'Sale', 'Sale'),
('u2', 'Trần Thị B', 'Kỹ thuật', 'Kỹ thuật'),
('u3', 'Lê Minh C', 'Marketing', 'Marketing');

-- Insert sample courses
INSERT INTO courses (id, name, department, level, description, assigned_roles, assigned_users, kpi_lead_eligible) VALUES
('c1', 'Kỹ năng chốt deal', 'Sale', 'Cơ bản', 'Chuẩn hóa kỹ năng xử lý từ chối, tư vấn giá trị và chốt giao dịch cho đội Sale.', ARRAY['Sale'], ARRAY['u1'], true),
('c2', 'Quy trình triển khai kỹ thuật', 'Kỹ thuật', 'Nâng cao', 'Tài liệu hóa quy trình triển khai, nghiệm thu và bàn giao kỹ thuật.', ARRAY['Kỹ thuật'], ARRAY['u2'], false);

-- Insert sample lessons with YouTube URLs
INSERT INTO lessons (id, course_id, title, type, content_url, video_url, duration, order_index) VALUES
('l1', 'c1', 'Tổng quan quy trình bán hàng', 'video', 'https://example.com/sales-flow.mp4', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 1),
('l2', 'c1', 'Tâm lý khách hàng và xử lý từ chối', 'video', 'https://example.com/objection.mp4', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 930, 2);

-- Insert sample quiz
INSERT INTO quizzes (id, course_id, title) VALUES
('q1', 'c1', 'Kiểm tra kỹ năng bán hàng');

-- Insert sample questions
INSERT INTO questions (id, quiz_id, question, options, correct_answer, order_index) VALUES
('q1_1', 'q1', 'Khi khách hàng nói giá quá cao, phản hồi tốt nhất là gì?', 
 '["Giảm giá ngay lập tức", "Giải thích giá trị sản phẩm", "Im lặng và chờ đợi", "Từ chối phục vụ"]'::jsonb, 
 1, 1);
```

## 5. Kiểm tra kết nối

Sau khi setup xong:

1. Restart dev server: `npm run dev`
2. Mở browser console (F12)
3. Kiểm tra không có lỗi Supabase
4. Thử tạo khóa học mới → Dữ liệu sẽ lưu vào Supabase thay vì localStorage

## 6. Chuyển từ localStorage sang Supabase

Hiện tại app đang dùng localStorage (mock data). Để chuyển sang Supabase:

### Option 1: Giữ cả 2 (Hybrid)
- localStorage: Dùng khi offline hoặc demo
- Supabase: Dùng khi có internet và đã config

### Option 2: Chỉ dùng Supabase
- Xóa localStorage logic
- Tất cả data từ Supabase
- Cần internet để hoạt động

## 7. API Endpoints

Với Supabase REST API, bạn có thể truy cập trực tiếp:

```
GET  https://ljsdoeyiwlrvcqeyfkya.supabase.co/rest/v1/courses
POST https://ljsdoeyiwlrvcqeyfkya.supabase.co/rest/v1/courses
GET  https://ljsdoeyiwlrvcqeyfkya.supabase.co/rest/v1/lessons
POST https://ljsdoeyiwlrvcqeyfkya.supabase.co/rest/v1/lessons
```

Headers cần thiết:
```
apikey: YOUR_PUBLISHABLE_KEY
Authorization: Bearer YOUR_PUBLISHABLE_KEY
Content-Type: application/json
```

## 8. Troubleshooting

### Lỗi: "Invalid API key"
→ Kiểm tra lại publishable key trong `.env.local`

### Lỗi: "relation does not exist"
→ Chưa chạy schema.sql, vào SQL Editor và chạy lại

### Lỗi: "permission denied"
→ Kiểm tra RLS policies đã được tạo chưa

### Data không hiển thị
→ Kiểm tra browser console để xem lỗi API
→ Vào Supabase Dashboard → Table Editor để xem data

## 9. Next Steps

Sau khi setup xong, bạn có thể:
- ✅ Tạo khóa học mới → Lưu vào Supabase
- ✅ Thêm bài học với YouTube URL
- ✅ Theo dõi tiến độ học của nhân viên
- ✅ Tạo quiz và câu hỏi
- ✅ Quản lý tuyển dụng
- ✅ Chấm công nhân viên

## 10. Service Layer đã tạo

File `src/lib/courseService.ts` đã có sẵn các function:
- `fetchCourses()` - Lấy danh sách khóa học
- `createCourse()` - Tạo khóa học mới
- `fetchLessons()` - Lấy danh sách bài học
- `createLesson()` - Tạo bài học mới
- `fetchProgress()` - Lấy tiến độ học
- `upsertProgress()` - Cập nhật tiến độ
- `fetchQuizzes()` - Lấy danh sách quiz
- `fetchQuestions()` - Lấy câu hỏi
- `createResult()` - Lưu kết quả quiz

Bạn có thể tích hợp vào `crmStore.tsx` để thay thế localStorage.
