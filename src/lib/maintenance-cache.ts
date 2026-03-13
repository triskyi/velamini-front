type MaintenanceCache = {
  on: boolean;
  expiresAt: number;
};

let cache: MaintenanceCache | null = null;

export function getMaintenanceCache(now = Date.now()): boolean | null {
  if (!cache || cache.expiresAt <= now) return null;
  return cache.on;
}

export function setMaintenanceCache(on: boolean, ttlMs: number): void {
  cache = { on, expiresAt: Date.now() + ttlMs };
}

export function getLastMaintenanceCacheValue(): boolean | null {
  return cache ? cache.on : null;
}

export function clearMaintenanceCache(): void {
  cache = null;
}
