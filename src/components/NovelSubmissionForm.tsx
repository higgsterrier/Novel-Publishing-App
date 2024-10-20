"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function NovelSubmissionForm() {
  const [title, setTitle] = useState("");
  //   const [synopsis, setSynopsis] = useState("");
  //   const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ title, synopsis, content }),
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        router.push("/my-novels");
      } else {
        const data = await response.json();
        setError(data.message || "Submission failed");
      }
    } catch (err) {
      setError(`An error: ${err} occurred. Please try again.`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-w-2xl mx-auto"
    >
      <div>
        <Label htmlFor="title">Novel Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      {/* <div>
        <Label htmlFor="synopsis">Synopsis</Label>
        <Textarea
          id="synopsis"
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Novel Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="min-h-[200px]"
        />
      </div> */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full">
        Submit Novel
      </Button>
    </form>
  );
}
