import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Novel from "@/models/Novel";
import { protect } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const user = await protect(request);
    if (!(user instanceof NextResponse)) {
      const body = await request.json();
      const { title, content, chapterNumber, novelId } = body;

      console.log('Debug - POST /api/chapters:', {
        userId: user._id,
        novelId,
        body
      });

      // Ensure valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(novelId)) {
        return NextResponse.json(
          { message: "Invalid novel ID format" },
          { status: 400 }
        );
      }

      // Find the novel and verify ownership
      const novel = await Novel.findOne({
        _id: new mongoose.Types.ObjectId(novelId),
        author: new mongoose.Types.ObjectId(user._id),
      });

      console.log('Debug - Novel search result:', {
        found: !!novel,
        novelAuthor: novel?.author,
        userId: user._id
      });

      if (!novel) {
        return NextResponse.json(
          { message: "Novel not found or unauthorized" },
          { status: 404 }
        );
      }

      if (!novel.hasChapters) {
        return NextResponse.json(
          { message: "This novel does not support chapters" },
          { status: 400 }
        );
      }

      // Validate required fields
      if (!title || !content || !chapterNumber) {
        return NextResponse.json(
          { message: "Missing required fields" },
          { status: 400 }
        );
      }

      // Add the chapter to the novel
      novel.chapters = novel.chapters || [];
      novel.chapters.push({
        title,
        content,
        chapterNumber,
      });

      // Sort chapters by chapter number
      novel.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

      await novel.save();

      return NextResponse.json(novel);
    } else {
      return user; // This is the error response from protect middleware
    }
  } catch (error) {
    console.error("Error in POST /api/chapters:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
