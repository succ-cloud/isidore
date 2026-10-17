import { promises as fs } from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data");

async function ensure() {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  await ensure();
  try {
    const raw = await fs.readFile(path.join(dir, name), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeJson<T>(name: string, data: T) {
  await ensure();
  const file = path.join(dir, name);
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(temp, file);
}

let queue: Promise<unknown> = Promise.resolve();

export function updateJson<T>(name: string, fallback: T, update: (current: T) => T) {
  const run = queue.then(async () => {
    const current = await readJson(name, fallback);
    const next = update(current);
    await writeJson(name, next);
    return next;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
