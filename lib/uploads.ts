import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 4 * 1024 * 1024;
const mimes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function asBuffer(data: unknown) {
  if (!data) return null;
  if (Buffer.isBuffer(data)) return Buffer.from(data);
  if (data instanceof Uint8Array) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  if (typeof data === "object" && "value" in data && typeof data.value === "function") {
    const view = data.value() as Uint8Array;
    if (view instanceof Uint8Array) return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
  }
  return null;
}

function sniff(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return "";
}

export function uploadError(file: File) {
  if (!file.size) return "Choose an image to upload.";
  if (file.size > MAX_BYTES) return "Images must be 4 MB or smaller.";
  return "";
}

export async function saveUploadedImage(file: File) {
  const problem = uploadError(file);
  if (problem) throw new Error(problem);
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = sniff(bytes);
  if (!extension) throw new Error("Use a JPEG, PNG, or WebP image.");
  const filename = `${crypto.randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);
  try {
    const { databaseReady } = await import("@/lib/database");
    const { UploadModel } = await import("@/lib/models");
    if (await databaseReady()) {
      await UploadModel.updateOne({ filename }, { $set: { filename, mime: mimes[extension], data: bytes } }, { upsert: true });
    }
  } catch (error) {
    console.error("Image was saved on disk but not in the database", error);
  }
  return `/uploads/${filename}`;
}

export async function readUploadedImage(filename: string) {
  if (!/^[\w.-]+$/.test(filename)) return null;
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const mime = mimes[extension];
  if (!mime) return null;
  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  try {
    return { bytes: await readFile(filePath), mime };
  } catch {
    // The file may live in the database when this server does not have the disk copy.
  }
  try {
    const { connectMongo } = await import("@/lib/mongo");
    const { UploadModel } = await import("@/lib/models");
    if (!(await connectMongo())) return null;
    const doc = await UploadModel.findOne({ filename }).lean<{ data?: Buffer; mime?: string }>();
    if (!doc?.data) return null;
    const bytes = asBuffer(doc.data);
    if (!bytes?.length) return null;
    await mkdir(path.dirname(filePath), { recursive: true }).catch(() => undefined);
    await writeFile(filePath, bytes).catch(() => undefined);
    return { bytes, mime: doc.mime || mime };
  } catch {
    return null;
  }
}

export async function removeUploadedImage(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const filename = path.basename(url.split("?")[0]);
  if (!/^[\w.-]+$/.test(filename)) return;
  await unlink(path.join(process.cwd(), "public", "uploads", filename)).catch(() => undefined);
  try {
    const { connectMongo } = await import("@/lib/mongo");
    const { UploadModel } = await import("@/lib/models");
    if (await connectMongo()) await UploadModel.deleteOne({ filename });
  } catch {
    // The disk copy is already gone. A later save can replace the database copy.
  }
}
