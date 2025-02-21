'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { INovel } from '@/models/Novel';
import { Pencil, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Type for serialized novel data in the frontend
type SerializedNovel = Omit<INovel, '_id' | 'author'> & {
  _id: string;
  author: string;
};

export default function MyWorksPage() {
  const [novels, setNovels] = useState<SerializedNovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchMyNovels = async () => {
      if (status === "unauthenticated") {
        router.push('/login');
        return;
      }

      if (status === "loading") {
        return;
      }

      try {
        const response = await fetch('/api/my-works');

        if (!response.ok) {
          throw new Error('Failed to fetch novels');
        }

        const data = await response.json();
        setNovels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMyNovels();
  }, [router, status, session]);

  const handleDelete = async (novelId: string) => {
    if (!confirm('Are you sure you want to delete this novel?')) {
      return;
    }

    if (status === "unauthenticated") {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/novels/${novelId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete novel');
      }

      // Remove the novel from the state
      setNovels(novels.filter(novel => novel._id !== novelId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete novel');
    }
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
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Works</h1>
        <Link href="/novels/publish">
          <Button>New Novel</Button>
        </Link>
      </div>

      {novels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven&apos;t published any novels yet.</p>
          <Link href="/novels/publish">
            <Button>Publish Your First Novel</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {novels.map((novel) => (
            <div
              key={novel._id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  <Link href={`/novels/${novel._id}`} className="hover:text-blue-600">
                    {novel.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-2">
                  {novel.genres?.join(", ") || 'No genre'}
                </p>
                <p className="text-sm text-gray-500">
                  Published on {new Date(novel.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/novels/${novel._id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(novel._id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
