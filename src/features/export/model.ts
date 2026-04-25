import { api } from '@/shared/api-client';

export async function downloadExcel(periodId?: number): Promise<Blob> {
  const query = periodId ? `?period_id=${periodId}` : '';
  return api.get<Blob>(`/export/schedule${query}`);
}

export function triggerBlobDownload(blob: Blob, fileName: string) {
  if (typeof window === 'undefined') return;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
