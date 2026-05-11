import { useMemo, useState, useEffect } from 'react';
import { apiRequest } from '@/app/(app)/instructor/_lib/studio-api';

interface FileItem {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  key: string;
  createdAt: string;
}

export function useLessonFiles(lessonId: string) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<FileItem[]>(`/api/training/${lessonId}/files`);
        setFiles(response || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch files');
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [lessonId]);

  const imageFiles = useMemo(() => {
    return files.filter((file) => file.mimetype.startsWith('image/'));
  }, [files]);

  return { files, images: imageFiles, loading, error };
}
