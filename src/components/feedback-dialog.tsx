"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FeedbackResponse = {
  message?: string;
};

export function FeedbackDialog() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pathname,
          pageUrl: typeof window !== "undefined" ? window.location.href : pathname,
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const payload = (await response.json()) as FeedbackResponse;

      if (!response.ok) {
        throw new Error(payload.message ?? "Could not submit feedback.");
      }

      setSuccess("Thanks. Feedback sent.");
      setEmail("");
      setMessage("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit feedback.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setError(null);
          setSuccess(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <MessageSquareWarning className="size-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share feedback</DialogTitle>
          <DialogDescription>
            Send bugs, ideas, or UX issues. This creates a GitHub issue.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submitFeedback}>
          <div className="space-y-2">
            <Label htmlFor="feedback-email">Email (optional)</Label>
            <Input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Message</Label>
            <Textarea
              id="feedback-message"
              required
              minLength={10}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What happened and what should be improved?"
              rows={6}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || message.trim().length < 10}>
              {isSubmitting ? "Sending..." : "Send feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
