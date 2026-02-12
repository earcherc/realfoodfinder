import { NextResponse } from "next/server";
import {
  createLocationSubmission,
  listApprovedLocations,
  locationSubmissionSchema,
} from "@/lib/location-repository";

export async function GET() {
  const locations = await listApprovedLocations();

  return NextResponse.json({ data: locations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
