"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Novel {
  _id: string;
  title: string;
  author: {
    name: string;
  };
  synopsis: string;
}

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/novels", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNovels(data);
        } else {
          console.error("Failed to fetch novels");
        }
      } catch (error) {
        console.error("Error fetching novels:", error);
      }
    };

    fetchNovels();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Novels</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {novels.map((novel) => (
          <Card key={novel._id}>
            <CardHeader>
              <CardTitle>{novel.title}</CardTitle>
              <CardDescription>by {novel.author.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{novel.synopsis}</p>
            </CardContent>
            <CardFooter>
              <Link href={`/novels/${novel._id}`} passHref>
                <Button>Read More</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
