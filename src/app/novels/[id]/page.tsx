'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { INovel } from '@/models/Novel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Author {
  _id: string;
  name: string;
}

export default function NovelPage() {
  const params = useParams();
  const [novel, setNovel] = useState<INovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterContent, setChapterContent] = useState<{ title: string; content: string; chapterNumber: number } | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);

  const fetchChapter = useCallback(async (chapterNumber: number) => {
    if (!novel) {
      return;
    }

    if (!novel.hasChapters || !Array.isArray(novel.chapters) || novel.chapters.length === 0) {
      setChapterError('No chapters available');
      setChapterContent(null);
      return;
    }

    if (chapterNumber < 1 || chapterNumber > novel.chapters.length) {
      setChapterError('Invalid chapter number');
      setChapterContent(null);
      return;
    }
    
    setChapterError(null);
    setChapterLoading(true);
    try {
      const chapter = novel.chapters[chapterNumber - 1];
      if (!chapter) {
        throw new Error('Chapter not found');
      }
      setChapterContent(chapter);
      setCurrentChapter(chapterNumber);
    } catch (err) {
      setChapterError(err instanceof Error ? err.message : 'Failed to load chapter');
      setChapterContent(null);
    } finally {
      setChapterLoading(false);
    }
  }, [novel]);

  useEffect(() => {
    const fetchNovel = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/novels/${params.id}`);
        if (!response.ok) {
          throw new Error('Novel not found');
        }
        const data = await response.json();
        setNovel(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch novel');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchNovel();
    }
  }, [params.id]);

  useEffect(() => {
    if (novel && novel.hasChapters && Array.isArray(novel.chapters) && novel.chapters.length > 0 && !chapterContent && !chapterError) {
      fetchChapter(1);
    }
  }, [novel, fetchChapter, chapterContent, chapterError]);

  const getAuthorName = (author: string | Author | { _id: string } | undefined): string => {
    if (!author) return 'Unknown Author';
    if (typeof author === 'string') return author;
    if ('name' in author) return author.name;
    return 'Unknown Author';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Novel not found'}
          </h1>
          <Link href="/novels">
            <Button>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Novels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/novels">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Novels
          </Button>
        </Link>
      </div>

      <article className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-4">{novel?.title}</h1>
        
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <span>By {getAuthorName(novel?.author)}</span>
          <span>·</span>
          <span>{novel?.genres?.join(", ") || "No genres"}</span>
          <span>·</span>
          <span>{novel?.createdAt ? new Date(novel.createdAt).toLocaleDateString() : "No date"}</span>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-700">{novel?.synopsis || "No description available"}</p>
        </div>

        <div className="prose max-w-none">
          {novel.hasChapters ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {chapterLoading ? (
                    <span className="animate-pulse">Loading chapter...</span>
                  ) : (
                    `Chapter ${currentChapter}: ${chapterContent?.title || ''}`
                  )}
                </h2>
                {novel.chapters && (
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => fetchChapter(currentChapter - 1)}
                      disabled={currentChapter <= 1 || chapterLoading}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous Chapter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fetchChapter(currentChapter + 1)}
                      disabled={currentChapter >= novel.chapters.length || chapterLoading}
                    >
                      Next Chapter
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {chapterError ? (
                <div className="text-red-600 p-4 rounded-lg bg-red-50">
                  {chapterError}
                </div>
              ) : chapterLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
              ) : chapterContent && chapterContent.content ? (
                chapterContent.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-1">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">No chapter content available</p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">Content</h2>
              {novel?.content && typeof novel.content === 'string' ? novel.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-1">
                  {paragraph}
                </p>
              )) : (
                <p className="text-gray-500 italic">No content available</p>
              )}
            </>
          )}
        </div>
      </article>
    </div>
  );
}
