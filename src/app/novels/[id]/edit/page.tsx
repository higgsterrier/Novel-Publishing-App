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

interface INewChapter {
  title: string;
  content: string;
  chapterNumber: number;
}

export default function EditNovelPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    synopsis: string;
    content: string;
    genres: NovelGenre[];
    hasChapters: boolean;
    chapters: (IChapter | INewChapter)[];
  }>({
    title: '',
    synopsis: '',
    content: '',
    genres: [],
    hasChapters: false,
    chapters: []
  });

  useEffect(() => {
    const fetchNovel = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`/api/novels/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch novel');
        }

        const novel = await response.json();
        setFormData({
          title: novel.title || '',
          synopsis: novel.synopsis || '',
          content: novel.content || '',
          genres: novel.genres || [],
          hasChapters: novel.hasChapters || false,
          chapters: novel.chapters?.map((chapter: IChapter) => ({
            title: chapter.title || '',
            content: chapter.content || '',
            chapterNumber: chapter.chapterNumber
          })) || []
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch novel');
      } finally {
        setLoading(false);
      }
    };

    fetchNovel();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/novels/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update novel');
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

  const handleContentFormatChange = (useChapters: boolean) => {
    setFormData(prev => ({
      ...prev,
      hasChapters: useChapters,
      chapters: useChapters 
        ? (prev.chapters.length 
          ? prev.chapters 
          : [{
              _id: '', // This will be set by the backend
              novelId: '', // This will be set by the backend
              title: '',
              content: prev.content || '',
              chapterNumber: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }]) 
        : [],
      content: useChapters ? '' : (prev.chapters[0]?.content || prev.content || '')
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/novels/${params.id}`}>
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Novel
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Edit Novel</h1>

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
            Content Format
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!formData.hasChapters}
                onChange={() => handleContentFormatChange(false)}
                className="form-radio"
              />
              <span>Single Content</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.hasChapters}
                onChange={() => handleContentFormatChange(true)}
                className="form-radio"
              />
              <span>Chapters</span>
            </label>
          </div>
        </div>

        {formData.hasChapters ? (
          <div className="space-y-6">
            {formData.chapters.map((chapter, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Chapter {chapter.chapterNumber}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeChapter(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove Chapter
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Chapter Title
                  </label>
                  <Input
                    value={chapter.title}
                    onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Chapter Content
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
            <Button
              type="button"
              onClick={addChapter}
              variant="outline"
              className="w-full"
            >
              Add Chapter
            </Button>
          </div>
        ) : (
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required={!formData.hasChapters}
              className="min-h-[400px]"
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Link href={`/novels/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
