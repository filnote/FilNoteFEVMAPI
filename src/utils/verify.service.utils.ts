import { JSONFilePreset } from 'lowdb/node';
import { join, dirname } from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

type VerificationItem = { expiresAt: number; uuid: string };
type VerificationsMap = Record<string, VerificationItem>;
type DbSchema = { verifications: VerificationsMap };

export function isArrayOfStrings(input: unknown): input is string[] {
  return Array.isArray(input) && input.every((i) => typeof i === 'string');
}

// Use Date.now() directly instead of wrapper function / 直接使用 Date.now() 而不是包装函数

export function pruneExpired(map: VerificationsMap): void {
  const t = Date.now();
  for (const [k, v] of Object.entries(map)) {
    if (
      !v ||
      typeof v.expiresAt !== 'number' ||
      v.expiresAt <= t ||
      !v.uuid ||
      typeof v.uuid !== 'string'
    ) {
      delete map[k];
    }
  }
}
export function ensureDbFile(filePath: string, defaultData: DbSchema) {
  try {
    const dir = dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
      return;
    }
    const txt = fs.readFileSync(filePath, 'utf8');
    JSON.parse(txt);
  } catch {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

export function normalizeAddress(addr: string) {
  return (addr || '').toLowerCase();
}

/**
 * Get verifyId (uuid) for address, returns null if not exists or expired / 获取地址对应的 verifyId (uuid)，不存在或过期时返回 null
 */
export function getVerifyIdByAddress(
  map: VerificationsMap,
  address: string,
): string | null {
  const key = normalizeAddress(address);
  const item = map[key];
  if (!item) return null;
  if (typeof item.expiresAt !== 'number' || item.expiresAt <= Date.now())
    return null;
  if (!item.uuid || typeof item.uuid !== 'string') return null;
  return item.uuid;
}

export async function openDb() {
  const dev = join(process.cwd(), 'src', 'utils', 'lowdb.json');
  const prod = join(process.cwd(), 'utils', 'lowdb.json');
  const path = fs.existsSync(dev) ? dev : prod;

  const defaultData: DbSchema = { verifications: {} };
  ensureDbFile(path, defaultData);
  const db = await JSONFilePreset<DbSchema>(path, defaultData);

  if (
    isArrayOfStrings(
      (db.data as unknown as { verifications?: unknown })?.verifications,
    )
  ) {
    const old = (db.data as unknown as { verifications: string[] })
      .verifications;
    const migrated: VerificationsMap = {};
    const ttlMs = 1 * 60 * 1000;
    const expireAt = Date.now() + ttlMs;
    for (const id of old) {
      migrated[id] = { expiresAt: expireAt, uuid: uuidv4() };
    }
    db.data.verifications = migrated;
    await db.write();
  }

  pruneExpired(db.data.verifications);
  await db.write();

  return db;
}
export async function saveDb(
  db: Awaited<ReturnType<typeof JSONFilePreset<DbSchema>>>,
): Promise<void> {
  pruneExpired(db.data.verifications);
  await db.write();
}
