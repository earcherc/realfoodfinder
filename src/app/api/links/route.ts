import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createLinkSubmission,
  linkSubmissionSchema,
  listApprovedLinks,
} from "@/lib/link-repository";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function GET() {
  const links = await listApprovedLinks();
  return NextResponse.json({ data: links });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token =
      typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const remoteIp =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const captcha = await verifyTurnstileToken({
      token,
      remoteIp,
      expectedAction: "submit_link",
    });

    if (!captcha.ok) {
      return NextResponse.json(
        { message: captcha.message ?? "Captcha verification failed." },
        { status: 400 },
      );
    }

    const payload = linkSubmissionSchema.parse(body);
    const created = await createLinkSubmission(payload);

    return NextResponse.json(
      {
        message: "Link submitted for review.",
        data: created,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: error.issues[0]?.message ?? "Invalid form fields.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not submit link. Please try again.",
      },
      { status: 400 },
    );
  }
}
