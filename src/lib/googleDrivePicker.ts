export interface GoogleDriveFile {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

declare global {
  interface Window {
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client?: {
        setApiKey: (key: string) => void;
      };
    };
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
      picker?: any;
    };
  }
}

const GOOGLE_API_SCRIPT = 'https://apis.google.com/js/api.js';
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
const DRIVE_READ_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

function config() {
  return {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY as string | undefined,
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined,
    appId: import.meta.env.VITE_GOOGLE_DRIVE_APP_ID as string | undefined,
  };
}

export function isGoogleDrivePickerConfigured() {
  const value = config();
  return Boolean(value.apiKey && value.clientId);
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

function loadPicker(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error('Google API chưa sẵn sàng.'));
      return;
    }

    window.gapi.load('client:picker', () => {
      window.gapi?.client?.setApiKey(apiKey);
      resolve();
    });
  });
}

function requestAccessToken(clientId: string, scope: string) {
  return new Promise<string>((resolve, reject) => {
    const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
      client_id: clientId,
      scope,
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

export async function pickGoogleDriveFile(): Promise<GoogleDriveFile> {
  const value = config();
  if (!value.apiKey || !value.clientId) {
    throw new Error('Chưa cấu hình Google API key hoặc OAuth Client ID.');
  }

  await Promise.all([loadScript(GOOGLE_API_SCRIPT), loadScript(GOOGLE_IDENTITY_SCRIPT)]);
  await loadPicker(value.apiKey);
  const accessToken = await requestAccessToken(value.clientId, DRIVE_READ_SCOPE);

  return new Promise((resolve, reject) => {
    const picker = window.google?.picker;
    if (!picker) {
      reject(new Error('Google Picker API chưa sẵn sàng.'));
      return;
    }

    const view = new picker.DocsView()
      .setIncludeFolders(false)
      .setSelectFolderEnabled(false);

    const builder = new picker.PickerBuilder()
      .addView(view)
      .enableFeature(picker.Feature.NAV_HIDDEN)
      .setOAuthToken(accessToken)
      .setDeveloperKey(value.apiKey)
      .setCallback((data: { action?: string; docs?: Array<{ id: string; name?: string; mimeType?: string; url?: string }> }) => {
        if (data.action !== picker.Action.PICKED) return;
        const doc = data.docs?.[0];
        if (!doc?.id) {
          reject(new Error('Không nhận được file từ Google Drive.'));
          return;
        }

        resolve({
          id: doc.id,
          name: doc.name || 'Google Drive file',
          url: doc.url || buildGoogleDriveUrl(doc.id),
          mimeType: doc.mimeType,
        });
      });

    if (value.appId) builder.setAppId(value.appId);
    builder.build().setVisible(true);
  });
}

export async function uploadGoogleDriveFiles(files: File[]): Promise<GoogleDriveFile[]> {
  const value = config();
  if (!value.clientId) {
    throw new Error('Chưa cấu hình Google OAuth Client ID.');
  }

  await loadScript(GOOGLE_IDENTITY_SCRIPT);
  const accessToken = await requestAccessToken(value.clientId, DRIVE_FILE_SCOPE);
  const uploaded: GoogleDriveFile[] = [];

  for (const file of files) {
    const metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
    };
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

    const result = await response.json() as { id: string; name: string; mimeType?: string; webViewLink?: string };
    uploaded.push({
      id: result.id,
      name: result.name,
      url: result.webViewLink || buildGoogleDriveUrl(result.id),
      mimeType: result.mimeType,
    });
  }

  return uploaded;
}
