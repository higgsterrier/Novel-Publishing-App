import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Novel, { INovel } from "@/models/Novel";
import { protect } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const novels = await Novel.find().populate("author", "name");
    return NextResponse.json(novels);
  } catch (error) {
    console.error("Error fetching novels:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch novels" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const user = await protect(request);
    if (!(user instanceof NextResponse)) {
      const body = await request.json();
      const { title, synopsis, content, genres, hasChapters } = body;

      console.log('Received novel data:', {
        hasChapters,
        contentPresent: !!content,
        contentLength: content?.length,
        genres
      });

      const novelData: Partial<INovel> = {
        title,
        synopsis,
        genres,
        hasChapters,
        author: user._id
      };

      // Only include content if not using chapters and content is provided
      if (!hasChapters) {
        if (!content || content.trim().length === 0) {
          return NextResponse.json(
            { error: "Content is required when not using chapters" },
            { status: 400 }
          );
        }
        novelData.content = content;
      }

      const novel = await Novel.create(novelData);

      return NextResponse.json(novel);
    } else {
      return user; // This is the error response from protect middleware
    }
  } catch (error) {
    console.error("Error creating novel:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create novel" },
      { status: 500 }
    );
  }
}
