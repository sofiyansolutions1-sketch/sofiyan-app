import { supabase } from '../supabaseClient';

/**
 * Storage Service for private 'app-files' bucket.
 * Folder rule: Every uploaded file path must start with userId:
 * ${userId}/${featureName}/${itemId}/${uuid}.${extension}
 */

export interface UploadOptions {
  userId: string;
  featureName: string; // e.g. 'partner_profile', 'partner_aadhaar', 'partner_shop', 'partner_reg_fee', 'partner_commission', 'blog_featured'
  itemId: string;      // entity ID or temp ID (e.g. partner ID, booking ID, blog ID, or 'general')
  file: File | Blob;
  customFileName?: string;
}

export interface UploadResult {
  filePath: string;
  signedUrl: string | null;
}

/**
 * Upload a file to private 'app-files' bucket using required directory layout:
 * `${userId}/${featureName}/${itemId}/${uuid}.${extension}`
 */
export async function uploadAppFile({
  userId,
  featureName,
  itemId,
  file,
  customFileName
}: UploadOptions): Promise<UploadResult> {
  const safeUserId = (userId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFeature = (featureName || 'general').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeItemId = (itemId || 'item').replace(/[^a-zA-Z0-9_-]/g, '_');

  const randomUuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let extension = 'jpg';
  if (customFileName && customFileName.includes('.')) {
    extension = customFileName.split('.').pop() || 'jpg';
  } else if ('name' in file && typeof file.name === 'string' && file.name.includes('.')) {
    extension = file.name.split('.').pop() || 'jpg';
  } else if (file.type) {
    const extFromType = file.type.split('/')[1];
    if (extFromType) extension = extFromType.replace('+xml', '');
  }

  const filePath = `${safeUserId}/${safeFeature}/${safeItemId}/${randomUuid}.${extension}`;

  const { data, error } = await supabase.storage
    .from('app-files')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg'
    });

  if (error) {
    console.error(`[StorageService] Upload error for ${filePath}:`, error);
    throw error;
  }

  const finalPath = data?.path || filePath;
  const signedUrl = await getSignedAppFileUrl(finalPath);

  return {
    filePath: finalPath,
    signedUrl
  };
}

/**
 * Generates a signed URL for a file in the private 'app-files' bucket.
 * Falls back to input if it's already an http URL or base64 data.
 */
export async function getSignedAppFileUrl(
  pathOrUrl: string | null | undefined,
  expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days
): Promise<string | null> {
  if (!pathOrUrl) return null;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return null;

  // If already a base64 or external url that doesn't belong to storage
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If it is a full public Supabase URL or relative path inside app-files
  let storagePath = trimmed;
  if (trimmed.includes('/storage/v1/object/public/app-files/')) {
    storagePath = trimmed.split('/storage/v1/object/public/app-files/')[1];
  } else if (trimmed.includes('/storage/v1/object/sign/app-files/')) {
    // Already signed URL or signed path
    return trimmed;
  } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it's a completely external image (e.g. Unsplash, Cloudinary, etc.)
    if (!trimmed.includes('/app-files/')) {
      return trimmed;
    }
  }

  try {
    const { data, error } = await supabase.storage
      .from('app-files')
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      // If error (e.g. file doesn't exist in bucket or is legacy public path), fallback to original
      return pathOrUrl;
    }
    return data.signedUrl;
  } catch (err) {
    console.warn(`[StorageService] Failed to create signed url for ${pathOrUrl}:`, err);
    return pathOrUrl;
  }
}

/**
 * Batch resolve signed URLs for multiple file paths/URLs.
 */
export async function batchGetSignedAppFileUrls(
  pathsOrUrls: (string | null | undefined)[],
  expiresInSeconds: number = 60 * 60 * 24 * 7
): Promise<(string | null)[]> {
  return Promise.all(pathsOrUrls.map(p => getSignedAppFileUrl(p, expiresInSeconds)));
}

/**
 * Deletes a file from Supabase Storage 'app-files' bucket.
 */
export async function deleteAppFile(pathOrUrl: string | null | undefined): Promise<boolean> {
  if (!pathOrUrl) return false;
  let storagePath = pathOrUrl.trim();

  if (storagePath.includes('/storage/v1/object/public/app-files/')) {
    storagePath = storagePath.split('/storage/v1/object/public/app-files/')[1];
  } else if (storagePath.includes('/storage/v1/object/sign/app-files/')) {
    storagePath = storagePath.split('/storage/v1/object/sign/app-files/')[1]?.split('?')[0];
  }

  // Do not attempt deletion on base64, blob, or external web URLs
  if (storagePath.startsWith('data:') || storagePath.startsWith('blob:') || storagePath.startsWith('http')) {
    return true;
  }

  try {
    const { error } = await supabase.storage.from('app-files').remove([storagePath]);
    if (error) {
      console.warn(`[StorageService] Could not delete file ${storagePath}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[StorageService] Deletion error for ${storagePath}:`, err);
    return false;
  }
}
