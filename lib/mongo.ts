import dns from "dns";
import mongoose from "mongoose";

type MongooseCache = {
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };
const cache = globalCache.mongooseCache ?? { promise: null };
globalCache.mongooseCache = cache;

export function mongoEnabled() {
  return Boolean(process.env.MONGODB_URI);
}

function databaseHost(uri: string) {
  return uri.match(/@([^/?]+)/)?.[1] ?? "";
}

function lookupSrv(host: string) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 2000);
    dns.resolveSrv(`_mongodb._tcp.${host}`, (error) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    });
  });
}

async function prepareDns(uri: string) {
  if (!uri.startsWith("mongodb+srv://")) return;
  const host = databaseHost(uri);
  if (!host) return;
  try {
    await lookupSrv(host);
  } catch {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!cache.promise) {
    cache.promise = prepareDns(uri)
      .then(() => mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 }))
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }
  return cache.promise;
}
