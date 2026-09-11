import fs from "fs";
import path from "path";
import type { AppStore } from "./types";
import { createSeedStore } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let writeQueue: Promise<void> = Promise.resolve();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readStore(): AppStore {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    const seed = createSeedStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw) as AppStore;
}

export function writeStore(store: AppStore): void {
  ensureDataDir();
  store.version = (store.version || 0) + 1;
  const tmp = STORE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf-8");
  fs.renameSync(tmp, STORE_PATH);
}

export async function updateStore(
  updater: (store: AppStore) => AppStore | void
): Promise<AppStore> {
  let resultStore: AppStore | null = null;
  let error: unknown = null;

  writeQueue = writeQueue.then(() => {
    try {
      const store = readStore();
      const result = updater(store);
      const next = result ?? store;
      writeStore(next);
      resultStore = next;
    } catch (e) {
      error = e;
    }
  });

  await writeQueue;

  if (error) throw error;
  return resultStore ?? readStore();
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function resetStore(): AppStore {
  ensureDataDir();
  const seed = createSeedStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), "utf-8");
  return seed;
}
