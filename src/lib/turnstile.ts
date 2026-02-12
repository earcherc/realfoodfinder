import "server-only";

type VerifyResult = {
  ok: boolean;
  message?: string;
};

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(params: {
  token: string;
  remoteIp?: string;
}): Promise<VerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

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

  if (params.remoteIp) {
    body.set("remoteip", params.remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      ok: false,
      message: "Captcha verification failed.",
    };
  }

  const data = (await response.json()) as TurnstileResponse;

  if (data.success) {
    return { ok: true };
  }

  return {
    ok: false,
    message: "Captcha verification was unsuccessful.",
  };
}
