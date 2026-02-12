import { NextResponse } from "next/server";
import { z } from "zod";

const feedbackSchema = z.object({
  pathname: z.string().trim().max(200).optional(),
  pageUrl: z.string().trim().max(500).optional(),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(request: Request) {
  try {
    const owner = process.env.GITHUB_FEEDBACK_OWNER;
    const repo = process.env.GITHUB_FEEDBACK_REPO;
    const token = process.env.GITHUB_FEEDBACK_TOKEN;

    if (!owner || !repo || !token) {
      return NextResponse.json(
        {
          message: "Feedback integration is not configured yet.",
        },
        { status: 503 },
      );
    }

    const parsed = feedbackSchema.parse(await request.json());
    const labels = (process.env.GITHUB_FEEDBACK_LABELS ?? "feedback")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const titlePreview =
      parsed.message.length > 70
        ? `${parsed.message.slice(0, 67).trim()}...`
        : parsed.message;

    const issueTitle = `[Feedback] ${titlePreview}`;
    const issueBody = [
      "## Feedback",
      parsed.message,
      "",
      "## Meta",
      `- Page: ${parsed.pathname ?? "unknown"}`,
      `- URL: ${parsed.pageUrl ?? "unknown"}`,
      `- Contact: ${parsed.email?.length ? parsed.email : "not provided"}`,
    ].join("\n");

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "realfoodfinder-feedback",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels,
        }),
      },
    );

    if (!githubResponse.ok) {
      const githubPayload = await githubResponse.text();
      throw new Error(`GitHub issue create failed: ${githubPayload}`);
    }

    return NextResponse.json({
      message: "Feedback submitted.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: error.issues[0]?.message ?? "Invalid feedback payload.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not send feedback.",
      },
      { status: 500 },
    );
  }
}
