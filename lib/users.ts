import type { UserRecord } from "@/lib/auth";
import { readJson, updateJson } from "@/lib/db";
import { databaseReady } from "@/lib/database";
import { UserModel } from "@/lib/models";

type UserDoc = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role?: "customer" | "admin";
  createdAt?: Date;
};

function fromDoc(doc: UserDoc): UserRecord {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? "",
    passwordHash: doc.passwordHash,
    role: doc.role ?? "customer",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
  };
}

export async function findUserById(id: string) {
  if (await databaseReady()) {
    const doc = await UserModel.findById(id).lean<UserDoc | null>();
    return doc ? fromDoc(doc) : null;
  }
  const users = await readJson<UserRecord[]>("users.json", []);
  return users.find((user) => user.id === id) ?? null;
}

export async function findUserByEmail(email: string) {
  if (await databaseReady()) {
    const doc = await UserModel.findOne({ email }).lean<UserDoc | null>();
    return doc ? fromDoc(doc) : null;
  }
  const users = await readJson<UserRecord[]>("users.json", []);
  return users.find((user) => user.email === email) ?? null;
}

export async function createUser(input: Omit<UserRecord, "createdAt">) {
  const record: UserRecord = { ...input, role: input.role ?? "customer", createdAt: new Date().toISOString() };
  if (await databaseReady()) {
    const doc = await UserModel.create({
      _id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      passwordHash: record.passwordHash,
      role: record.role,
    });
    return fromDoc(doc.toObject() as UserDoc);
  }
  await updateJson<UserRecord[]>("users.json", [], (current) => [...current, record]);
  return record;
}
