# XOXO CRM - Dao tao noi bo va tuyen dung

Ung dung React/Vite mo phong he thong CRM nhan su cho hai nghiep vu chinh:

- **Dao tao noi bo / LMS**: quan ly khoa hoc theo phong ban, bai hoc video/tai lieu, gan khoa hoc cho nhan vien, theo doi tien do hoc va quiz pass/fail.
- **Tuyen dung / Recruitment Kanban**: quan ly vi tri tuyen dung, ung vien, CV/file, lich phong van, ket qua danh gia, lich su stage va pipeline 10 trang thai.

## Chuc nang chinh

### Module dao tao

- Khoa hoc theo phong ban Sale, Ky thuat, Marketing.
- Moi khoa co level, mo ta, video, tai lieu va tien do hoan thanh.
- Gan khoa hoc cho nhan vien.
- Theo doi enrollment status: chua hoc, dang hoc, hoan thanh.
- Quiz trac nghiem, cham diem theo phan tram.
- Pass/fail voi nguong `>= 70%`.
- Luu du lieu demo bang `localStorage`.

### Module tuyen dung

- Dashboard tuyen dung voi thong ke vi tri, ung vien, phong van, nhan viec.
- Bang vi tri tuyen dung: title, department, quantity needed, quantity hired, status.
- Kanban day du 10 stage:
  - Moi ung tuyen
  - Da sang loc
  - Hen phong van
  - Da phong van
  - Test chuyen mon
  - Cho quyet dinh
  - Nhan viec
  - Thu viec
  - Chinh thuc
  - Loai
- Keo tha ung vien giua cac stage.
- Tu dong luu lich su thay doi stage.
- Ho so ung vien gom thong tin lien he, vi tri, nguon, ghi chu, CV/file, lich su hoat dong.
- Tao lich phong van va ghi nhan ket qua.
- Chuyen ung vien sang `Chinh thuc` de tao nhan vien demo.

## Cong nghe

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Lucide React icons
- Motion
- `localStorage` cho du lieu demo

## Chay local

Yeu cau: Node.js

```bash
npm install
npm run dev
```

Mac dinh app chay tai:

```text
http://localhost:3000
```

Kiem tra type/build:

```bash
npm run lint
npm run build
```

## Ghi chu

Day la prototype frontend hoan chinh cho demo/nghiem thu luong nghiep vu theo spec. Neu dua vao production, can bo sung backend/API, database that, auth/phan quyen, upload file that va deployment pipeline.
