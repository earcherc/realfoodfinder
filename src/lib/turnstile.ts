import "server-only";
import { randomUUID } from "node:crypto";

type VerifyResult = {
  ok: boolean;
  message?: string;
};

type TurnstileResponse = {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(params: {
  token: string;
  remoteIp?: string;
  expectedAction?: string;
}): Promise<VerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const expectedHostnames = (process.env.TURNSTILE_EXPECTED_HOSTNAMES ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        message: "Captcha is not configured.",
      };
    }

    return { ok: true };
  }

  if (!params.token) {
    return {
      ok: false,
      message: "Captcha token is missing.",
    };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", params.token);
  body.set("idempotency_key", randomUUID());

  if (params.remoteIp) {
    body.set("remoteip", params.remoteIp);
  }

  let response: Response;
  try {
    response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("Turnstile verification request failed", error);
    return {
      ok: false,
      message: "Captcha verification failed. Please try again.",
    };
  }

  let data: TurnstileResponse | null = null;
  try {
    data = (await response.json()) as TurnstileResponse;
  } catch (error) {
    console.error("Turnstile verification returned non-JSON response", error);
  }

  if (!response.ok) {
    return {
      ok: false,
      message: "Captcha verification failed. Please try again.",
    };
  }

  if (!data) {
    return {
      ok: false,
      message: "Captcha verification failed. Please try again.",
    };
  }

  if (!data.success) {
    const codes = data["error-codes"] ?? [];
    const mainCode = codes[0];

    console.error("Turnstile rejected token", {
      codes,
      hostname: data.hostname,
      action: data.action,
    });

    if (mainCode === "timeout-or-duplicate") {
      return {
        ok: false,
        message: "Captcha expired. Please verify again and submit.",
      };
    }

    if (mainCode === "invalid-input-secret" || mainCode === "missing-input-secret") {
      return {
        ok: false,
        message: "Captcha is misconfigured on the server.",
      };
    }

    return {
      ok: false,
      message: `Captcha verification failed${codes.length > 0 ? ` (${codes.join(", ")})` : "."}`,
    };
  }

  if (params.expectedAction && data.action !== params.expectedAction) {
    console.error("Turnstile action mismatch", {
      expected: params.expectedAction,
      received: data.action,
    });
    return {
      ok: false,
      message: "Captcha verification failed. Please refresh and try again.",
    };
  }

  if (
    expectedHostnames.length > 0 &&
    (!data.hostname || !expectedHostnames.includes(data.hostname.toLowerCase()))
  ) {
    console.error("Turnstile hostname mismatch", {
      expected: expectedHostnames,
      received: data.hostname,
    });
    return {
      ok: false,
      message: "Captcha verification failed for this host.",
    };
  }

  return { ok: true };
}
