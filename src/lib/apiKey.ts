import crypto from "crypto";

const PREFIX = "vela_";

/**
 * Generate a new API key.
 * Returns the PLAINTEXT key (shown ONCE to the org owner, never again)
 * and its SHA-256 hash (what gets stored in the database).
 *
 * 32 bytes of CSPRNG = 256 bits of entropy.
 * base64url encoding gives URL-safe characters, no +/= padding.
 * Total format: vela_[43 chars] ≈ 48 chars total.
 */
export function generateApiKey(): { key: string; hash: string } {
  const raw  = crypto.randomBytes(32).toString("base64url");
  const key  = `${PREFIX}${raw}`;
  const hash = hashApiKey(key);
  return { key, hash };
}

/**
 * SHA-256 hash of an API key for database storage.
 *
 * SHA-256 (not bcrypt) is appropriate here because:
 *  - Keys are already cryptographically random (not user passwords)
 *  - Every API request must hash + query — bcrypt's intentional slowness
 *    would add 200–400 ms latency per request
 *  - 256-bit entropy makes brute-forcing the hash infeasible
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Timing-safe comparison to prevent timing-oracle attacks.
 * Always compare hashes, never plaintext.
 */
export function verifyApiKey(plaintext: string, storedHash: string): boolean {
  const hash = hashApiKey(plaintext);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash,       "hex"),
      Buffer.from(storedHash, "hex")
    );
  } catch {
    return false; // length mismatch
  }
}
