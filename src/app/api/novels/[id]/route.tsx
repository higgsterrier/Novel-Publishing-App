import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Novel from "@/models/Novel";
import { protect } from "@/lib/auth";

interface Chapter {
  _id?: string;
  title: string;
  chapterNumber: number;
  content: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const novel = await Novel.findById(params.id)
      .populate("author", "name")
      .lean();

    if (!novel) {
      return NextResponse.json(
        { error: "Novel not found" },
        { status: 404 }
      );
    }

    if (novel.hasChapters && novel.chapters) {
      novel.chapters = novel.chapters.map((chapter: Chapter) => ({
        ...chapter,
        _id: chapter._id?.toString() || chapter._id
      }));
    }

    return NextResponse.json(novel);
  } catch (error) {
    console.error("Error fetching novel:", error);
    return NextResponse.json(
      { error: "Failed to fetch novel" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Verify user authentication and get user data
    const user = await protect(request);
    if (user instanceof NextResponse) {
      return user; // Return error response if authentication fails
    }

    // Find the novel and verify ownership
    const novel = await Novel.findById(params.id);
    if (!novel) {
      return NextResponse.json(
        { error: "Novel not found" },
        { status: 404 }
      );
    }

    // Check if the user is the author of the novel
    if (novel.author._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Not authorized to edit this novel" },
        { status: 403 }
      );
    }

    // Get the update data from request body
    const body = await request.json();
    const { title, synopsis, content, genres, hasChapters, chapters } = body;

    // Validate required fields
    if (!title || !synopsis || !genres || genres.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate content based on hasChapters
    if (!hasChapters && (!content || content.trim().length === 0)) {
      return NextResponse.json(
        { error: "Content is required for non-chaptered novels" },
        { status: 400 }
      );
    }

    if (hasChapters && (!chapters || chapters.length === 0)) {
      return NextResponse.json(
        { error: "At least one chapter is required" },
        { status: 400 }
      );
    }

    // Update the novel
    const updateData = {
      title,
      synopsis,
      genres,
      hasChapters,
      updatedAt: new Date(),
      ...(hasChapters ? { chapters, content: undefined } : { content, chapters: [] })
    };

    const updatedNovel = await Novel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedNovel);
  } catch (error) {
    console.error("Error updating novel:", error);
    return NextResponse.json(
      { error: "Failed to update novel" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Verify user authentication and get user data
    const user = await protect(request);
    if (user instanceof NextResponse) {
      return user; // Return error response if authentication fails
    }

    // Find the novel and verify ownership
    const novel = await Novel.findById(params.id);
    if (!novel) {
      return NextResponse.json(
        { error: "Novel not found" },
        { status: 404 }
      );
    }

    // Check if the user is the author of the novel
    if (novel.author._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Not authorized to delete this novel" },
        { status: 403 }
      );
    }

    // Delete the novel
    await Novel.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Novel deleted successfully" });
  } catch (error) {
    console.error("Error deleting novel:", error);
    return NextResponse.json(
      { error: "Failed to delete novel" },
      { status: 500 }
    );
  }
}
