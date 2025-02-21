"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NOVEL_GENRES as GENRES, NovelGenre } from "@/models/Novel";

interface Author {
  _id: string;
  name: string;
}

interface Novel {
  _id: string;
  title: string;
  author: string | Author | { _id: string };
  genres: NovelGenre[];
  synopsis: string;
}

const getAuthorName = (author: Novel['author']): string => {
  if (!author) return 'Unknown Author';
  if (typeof author === 'string') return author;
  if (author && typeof author === 'object' && 'name' in author) return author.name;
  return 'Unknown Author';
};

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<NovelGenre[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const response = await fetch("/api/novels");
        if (response.ok) {
          const data = await response.json();
          setNovels(data);
          setFilteredNovels(data);
        } else {
          console.error("Failed to fetch novels");
        }
      } catch (error) {
        console.error("Error fetching novels:", error);
      }
    };

    fetchNovels();
  }, []);

  useEffect(() => {
    const results = novels.filter(novel => {
      const matchesSearch = 
        novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAuthorName(novel.author).toLowerCase().includes(searchTerm.toLowerCase()) ||
        novel.synopsis.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenres = selectedGenres.length === 0 || 
        novel.genres.some(genre => selectedGenres.includes(genre));
      
      return matchesSearch && matchesGenres;
    });
    setFilteredNovels(results);
  }, [searchTerm, selectedGenres, novels]);

  const handleGenreSelect = (genre: NovelGenre) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const removeGenre = (genreToRemove: NovelGenre) => {
    setSelectedGenres(selectedGenres.filter(genre => genre !== genreToRemove));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Search novels by title, author, or synopsis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex flex-col space-y-2">
          <select
            value=""
            onChange={(e) => handleGenreSelect(e.target.value as NovelGenre)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Genres...</option>
            {GENRES.filter(genre => !selectedGenres.includes(genre)).map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          {selectedGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedGenres.map(genre => (
                <span
                  key={genre}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {genre}
                  <button
                    onClick={() => removeGenre(genre)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNovels.map((novel) => (
          <Card key={novel._id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{novel.title}</CardTitle>
              <CardDescription>
                By {getAuthorName(novel.author)} · {novel.genres?.join(", ") || "No genres"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 line-clamp-3">{novel.synopsis}</p>
            </CardContent>
            <CardFooter>
              <Link
                href={`/novels/${novel._id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Read More
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredNovels.length === 0 && (
        <div className="text-center text-gray-600 mt-8">
          No novels found matching your search.
        </div>
      )}
    </div>
  );
}
