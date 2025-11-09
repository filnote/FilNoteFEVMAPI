import { JSONFilePreset } from 'lowdb/node';
import { join, dirname } from 'path';
import fs from 'fs';
import { UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

type VerificationItem = { expiresAt: number; uuid: string };
type VerificationsMap = Record<string, VerificationItem>;
type DbSchema = { verifications: VerificationsMap };

export function isArrayOfStrings(input: unknown): input is string[] {
  return Array.isArray(input) && input.every((i) => typeof i === 'string');
}

export function now() {
  return Date.now();
}

export function pruneExpired(map: VerificationsMap): void {
  const t = now();
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
 * 使用 地址 + verifyId(uuid) 校验有效性：
 * - 地址对应的记录必须存在
 * - uuid 必须匹配 verifyId
 * - 未过期
 * 校验失败会删除该地址下的记录，并抛未授权
 */
export function assertValidVerifyPair(
  map: VerificationsMap,
  address: string,
  verifyId: string,
) {
  const key = normalizeAddress(address);
  const item = map[key];
  if (!verifyId || !item) {
    delete map[key];
    throw new UnauthorizedException('verifyId 无效或未授权');
  }
  if (item.uuid !== verifyId) {
    delete map[key];
    throw new UnauthorizedException('verifyId 不匹配');
  }
  if (typeof item.expiresAt !== 'number' || item.expiresAt <= now()) {
    delete map[key];
    throw new UnauthorizedException('verifyId 已过期');
  }
}

/**
 * 获取地址对应的 verifyId（uuid），不存在或过期时返回 null
 */
export function getVerifyIdByAddress(
  map: VerificationsMap,
  address: string,
): string | null {
  const key = normalizeAddress(address);
  const item = map[key];
  if (!item) return null;
  if (typeof item.expiresAt !== 'number' || item.expiresAt <= now()) return null;
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

  if (isArrayOfStrings((db.data as any)?.verifications)) {
    const old = (db.data as any).verifications as string[];
    const migrated: VerificationsMap = {};
    const ttlMs = 1 * 60 * 1000;
    const expireAt = now() + ttlMs;
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
