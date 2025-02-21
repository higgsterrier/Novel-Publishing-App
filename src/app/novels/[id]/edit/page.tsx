'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NOVEL_GENRES, NovelGenre } from '@/models/Novel';
import { IChapter } from '@/models/Chapter';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface INewChapter {
  title: string;
  content: string;
  chapterNumber: number;
}

export default function EditNovelPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    synopsis: string;
    content: string;
    genres: NovelGenre[];
    hasChapters: boolean;
    chapters: (IChapter | INewChapter)[];
    author?: string;
  }>({
    title: '',
    synopsis: '',
    content: '',
    genres: [],
    hasChapters: false,
    chapters: []
  });

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const fetchNovel = async () => {
      if (!session?.user || initialLoadDone) return;

      try {
        const response = await fetch(`/api/novels/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch novel');
        }

        const novel = await response.json();
        setFormData({
          title: novel.title,
          synopsis: novel.synopsis,
          content: novel.content || '',
          genres: novel.genres,
          hasChapters: novel.hasChapters,
          chapters: novel.chapters || [],
          author: novel.author._id
        });
        setInitialLoadDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch novel');
      } finally {
        setLoading(false);
      }
    };

    fetchNovel();
  }, [initialLoadDone, params.id, router, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/novels/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update novel');
      }

      router.push(`/novels/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update novel');
    }
  };

  const handleGenreToggle = (genre: NovelGenre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleChapterChange = (index: number, field: 'title' | 'content', value: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) =>
        i === index ? { ...chapter, [field]: value } : chapter
      )
    }));
  };

  const addChapter = () => {
    setFormData(prev => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        {
          title: '',
          content: '',
          chapterNumber: prev.chapters.length + 1
        }
      ]
    }));
  };

  const removeChapter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters
        .filter((_, i) => i !== index)
        .map((chapter, i) => ({
          ...chapter,
          chapterNumber: i + 1
        }))
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/novels/${params.id}`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Novel
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Edit Novel</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="synopsis" className="block text-sm font-medium text-gray-700">
            Synopsis
          </label>
          <Textarea
            id="synopsis"
            value={formData.synopsis}
            onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
            required
            maxLength={2000}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {NOVEL_GENRES.map((genre) => (
              <Button
                key={genre}
                type="button"
                variant={formData.genres.includes(genre) ? "default" : "outline"}
                onClick={() => handleGenreToggle(genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={!formData.hasChapters}
                onChange={() => setFormData({ ...formData, hasChapters: false })}
                className="mr-2"
              />
              Single Content
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.hasChapters}
                onChange={() => setFormData({ ...formData, hasChapters: true })}
                className="mr-2"
              />
              Chapters
            </label>
          </div>
        </div>

        {!formData.hasChapters ? (
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required={!formData.hasChapters}
              className="min-h-[300px]"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Chapters</h3>
              <Button type="button" onClick={addChapter}>
                Add Chapter
              </Button>
            </div>
            {formData.chapters.map((chapter, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium">Chapter {chapter.chapterNumber}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeChapter(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    value={chapter.title}
                    onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <Textarea
                    value={chapter.content}
                    onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                    required
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
