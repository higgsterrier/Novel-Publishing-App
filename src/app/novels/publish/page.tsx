"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { NOVEL_GENRES, NovelGenre, IChapterInfo } from "@/models/Novel";

type Chapter = Omit<IChapterInfo, '_id'>;

export default function PublishNovelPage() {
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [content, setContent] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<NovelGenre[]>([]);
  const [error, setError] = useState("");
  const [hasChapters, setHasChapters] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleGenreSelect = (genre: NovelGenre) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleGenreRemove = (genreToRemove: NovelGenre) => {
    setSelectedGenres(selectedGenres.filter(genre => genre !== genreToRemove));
  };

  const addChapter = () => {
    const newChapterNumber = chapters.length + 1;
    setChapters([
      ...chapters,
      { title: "", content: "", chapterNumber: newChapterNumber },
    ]);
  };

  const updateChapter = (index: number, field: keyof Chapter, value: string) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = {
      ...updatedChapters[index],
      [field]: value,
    };
    setChapters(updatedChapters);
  };

  const removeChapter = (index: number) => {
    const updatedChapters = chapters.filter((_, i) => i !== index);
    // Update chapter numbers
    const reorderedChapters = updatedChapters.map((chapter, idx) => ({
      ...chapter,
      chapterNumber: idx + 1,
    }));
    setChapters(reorderedChapters);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!title || !synopsis || selectedGenres.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    if (!hasChapters && !content) {
      setError("Please provide content for your novel");
      return;
    }

    if (hasChapters && chapters.length === 0) {
      setError("Please add at least one chapter");
      return;
    }

    if (hasChapters && chapters.some(chapter => !chapter.title || !chapter.content)) {
      setError("Please fill in all chapter titles and contents");
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/login");
        return;
      }

      // First create the novel
      const novelResponse = await fetch("/api/novels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          synopsis,
          ...(hasChapters ? {} : { content }),
          genres: selectedGenres,
          hasChapters,
        }),
      });

      if (!novelResponse.ok) {
        throw new Error("Failed to create novel");
      }

      const novel = await novelResponse.json();

      // If using chapters, create them
      if (hasChapters) {
        for (const chapter of chapters) {
          const chapterResponse = await fetch("/api/chapters", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...chapter,
              novelId: novel._id,
            }),
          });

          if (!chapterResponse.ok) {
            throw new Error("Failed to create chapter");
          }
        }
      }

      router.push(`/novels/${novel._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish novel");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Publish Your Novel</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your novel's title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="synopsis">Synopsis</Label>
          <Textarea
            id="synopsis"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Write a brief synopsis of your novel"
          />
        </div>

        <div className="space-y-2">
          <Label>Genres</Label>
          <div className="flex flex-wrap gap-2">
            {NOVEL_GENRES.map((genre) => (
              <Button
                key={genre}
                type="button"
                variant={selectedGenres.includes(genre as NovelGenre) ? "default" : "outline"}
                onClick={() => 
                  selectedGenres.includes(genre as NovelGenre)
                    ? handleGenreRemove(genre as NovelGenre)
                    : handleGenreSelect(genre as NovelGenre)
                }
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="chapters-mode"
            checked={hasChapters}
            onCheckedChange={setHasChapters}
          />
          <Label htmlFor="chapters-mode">Use Chapters</Label>
        </div>

        {!hasChapters ? (
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your novel's content"
              className="min-h-[300px]"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Chapters</h2>
              <Button type="button" onClick={addChapter}>
                Add Chapter
              </Button>
            </div>
            
            {chapters.map((chapter, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Chapter {chapter.chapterNumber}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeChapter(index)}
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`chapter-${index}-title`}>Chapter Title</Label>
                  <Input
                    id={`chapter-${index}-title`}
                    value={chapter.title}
                    onChange={(e) => updateChapter(index, "title", e.target.value)}
                    placeholder="Enter chapter title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`chapter-${index}-content`}>Chapter Content</Label>
                  <Textarea
                    id={`chapter-${index}-content`}
                    value={chapter.content}
                    onChange={(e) => updateChapter(index, "content", e.target.value)}
                    placeholder="Write your chapter content"
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <Button type="submit" className="w-full">
          Publish Novel
        </Button>
      </form>
    </div>
  );
}
