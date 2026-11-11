import crypto from "crypto";

/**
 * Checks whether a password has appeared in public data breaches
 * using HaveIBeenPwned's k-Anonymity range API.
 * 
 * Never sends the password or the full hash over the network.
 * Only sends the first 5 characters of the SHA-1 hash.
 */
export async function checkPwnedPassword(
  password: string
): Promise<{ breached: boolean; count: number }> {
  try {
    // 1. Calculate uppercase SHA-1 hash
    const sha1Hash = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();

    // 2. Extract 5-character prefix and 35-character suffix
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // 3. Query the k-Anonymity range endpoint
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "User-Agent": "LizsGrillzBookings-SecurityCheck",
        },
        // Short timeout so external network drops don't block registration
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!response.ok) {
      console.warn(
        `[BREACH CHECK] HIBP API returned status ${response.status}. Failing open to avoid blocking user.`
      );
      return { breached: false, count: 0 };
    }

    const text = await response.text();
    const lines = text.split("\n");

    // 4. Scan returned suffixes locally in memory
    for (const line of lines) {
      const [returnedSuffix, countStr] = line.trim().split(":");
      if (returnedSuffix === suffix) {
        const count = parseInt(countStr, 10) || 1;
        return { breached: true, count };
      }
    }

    return { breached: false, count: 0 };
  } catch (err: any) {
    console.warn(`[BREACH CHECK ERROR] Failed to query HIBP:`, err.message);
    // Fail open if HIBP is down or timeout expires
    return { breached: false, count: 0 };
  }
}

