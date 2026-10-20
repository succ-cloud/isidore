import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 4 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function uploadError(file: File) {
  if (!extensions[file.type]) return "Use a JPEG, PNG, or WebP image.";
  if (file.size > MAX_BYTES) return "Images must be 4 MB or smaller.";
  return "";
}

export async function saveUploadedImage(file: File) {
  const problem = uploadError(file);
  if (problem) throw new Error(problem);
  const filename = `${crypto.randomUUID()}.${extensions[file.type]}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

export async function removeUploadedImage(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const filename = path.basename(url);
  if (!/^[\w.-]+$/.test(filename)) return;
  await unlink(path.join(process.cwd(), "public", "uploads", filename)).catch(() => undefined);
}
