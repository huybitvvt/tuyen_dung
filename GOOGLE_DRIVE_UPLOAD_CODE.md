# Google Drive Upload Code

File này gom phần code kết nối Google Drive để gửi cho khách. Code dùng Google Identity Services để xin quyền OAuth, sau đó upload file lên Google Drive bằng Google Drive API `files.create`.

## 1. Biến môi trường cần có

```env
VITE_GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com"
VITE_GOOGLE_DRIVE_APP_ID="YOUR_GOOGLE_CLOUD_PROJECT_NUMBER"

# Không bắt buộc. Nếu muốn upload vào 1 thư mục Drive cố định thì điền folder id ở đây.
VITE_GOOGLE_DRIVE_FOLDER_ID="YOUR_GOOGLE_DRIVE_FOLDER_ID"
```

Google Cloud cần bật:

- Google Drive API
- Google Picker API nếu có dùng chọn file từ Drive
- OAuth Client loại Web application
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - domain Vercel production, ví dụ `https://your-domain.vercel.app`

Scope đang dùng để upload:

```txt
https://www.googleapis.com/auth/drive.file
```

## 2. File code upload Google Drive

```ts
export interface GoogleDriveFile {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

function googleDriveConfig() {
  return {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined,
    folderId: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID as string | undefined,
  };
}

export function isGoogleDriveConfigured() {
  const config = googleDriveConfig();
  return Boolean(config.clientId);
}

export function buildGoogleDriveUrl(fileId: string) {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existing) {
      if (existing.dataset.loaded === '1') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Không tải được ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = '1';
      resolve();
    };
    script.onerror = () => reject(new Error(`Không tải được ${src}`));
    document.head.appendChild(script);
  });
}

function requestGoogleDriveAccessToken(clientId: string) {
  return new Promise<string>((resolve, reject) => {
    const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
      client_id: clientId,
      scope: DRIVE_FILE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error('Không lấy được quyền Google Drive.'));
          return;
        }

        resolve(response.access_token);
      },
    });

    if (!tokenClient) {
      reject(new Error('Google OAuth chưa sẵn sàng.'));
      return;
    }

    tokenClient.requestAccessToken();
  });
}

export async function uploadGoogleDriveFiles(files: File[]): Promise<GoogleDriveFile[]> {
  const config = googleDriveConfig();

  if (!config.clientId) {
    throw new Error('Chưa cấu hình VITE_GOOGLE_CLIENT_ID.');
  }

  await loadScript(GOOGLE_IDENTITY_SCRIPT);

  const accessToken = await requestGoogleDriveAccessToken(config.clientId);
  const uploadedFiles: GoogleDriveFile[] = [];

  for (const file of files) {
    const metadata: Record<string, unknown> = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
    };

    // Nếu khách muốn upload vào 1 folder Drive cố định, điền VITE_GOOGLE_DRIVE_FOLDER_ID.
    if (config.folderId) {
      metadata.parents = [config.folderId];
    }

    const boundary = `xoxo_drive_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body = new Blob(
      [
        delimiter,
        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
        JSON.stringify(metadata),
        delimiter,
        `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
        file,
        closeDelimiter,
      ],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Upload Google Drive thất bại: ${message || response.statusText}`);
    }

    const result = (await response.json()) as {
      id: string;
      name: string;
      mimeType?: string;
      webViewLink?: string;
    };

    uploadedFiles.push({
      id: result.id,
      name: result.name,
      url: result.webViewLink || buildGoogleDriveUrl(result.id),
      mimeType: result.mimeType,
    });
  }

  return uploadedFiles;
}
```

## 3. Cách gọi trong form thêm ứng viên

```ts
async function handleSaveCandidate(selectedFiles: File[]) {
  if (!isGoogleDriveConfigured()) {
    throw new Error('Chưa cấu hình Google Drive API.');
  }

  const uploadedFiles = await uploadGoogleDriveFiles(selectedFiles);

  const candidatePayload = {
    name: 'Nguyễn Văn A',
    phone: '0901 234 567',
    email: 'candidate@email.com',
    source: 'Facebook',
    cvFiles: uploadedFiles.map((file) => ({
      name: file.name,
      url: file.url,
      driveFileId: file.id,
      mimeType: file.mimeType,
    })),
  };

  // Lưu candidatePayload vào database/app store.
  return candidatePayload;
}
```

## 4. File đang dùng trong dự án

Trong source hiện tại, phần code chính nằm ở:

```txt
src/lib/googleDrivePicker.ts
```

Form thêm ứng viên gọi upload ở:

```txt
src/views/CandidateList.tsx
```

Luồng xử lý:

1. Người dùng chọn ảnh/CV từ máy.
2. App gọi `uploadGoogleDriveFiles(selectedFiles)`.
3. Google hiện popup xin quyền Drive.
4. File được upload lên Drive bằng Google Drive API.
5. App nhận lại `id`, `name`, `mimeType`, `webViewLink`.
6. App lưu link Drive vào hồ sơ ứng viên.
