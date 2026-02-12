import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createLocationSubmission,
  listApprovedLocations,
  locationSubmissionSchema,
} from "@/lib/location-repository";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function GET() {
  const locations = await listApprovedLocations();

  return NextResponse.json({ data: locations });
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
      expectedAction: "submit_location",
    });

    if (!captcha.ok) {
      return NextResponse.json(
        { message: captcha.message ?? "Captcha verification failed." },
        { status: 400 },
      );
    }

    const payload = locationSubmissionSchema.parse(body);
    const created = await createLocationSubmission(payload);

    return NextResponse.json(
      {
        message: "Location submitted for review.",
        data: created,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const issue = error.issues[0];

      return NextResponse.json(
        {
          message: issue?.message ?? "Invalid form fields.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not submit location. Please try again.",
      },
      { status: 400 },
    );
  }
}
