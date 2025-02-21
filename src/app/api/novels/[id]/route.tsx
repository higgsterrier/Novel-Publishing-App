import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Novel, { INovel } from "@/models/Novel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface Chapter {
  _id?: string;
  title: string;
  chapterNumber: number;
  content: string;
}

interface PopulatedAuthor {
  _id: mongoose.Types.ObjectId;
  name: string;
}

// Interface for serialized novel (with string IDs instead of ObjectIds)
interface SerializedNovel extends Omit<INovel, '_id' | 'author'> {
  _id: string;
  author: {
    _id: string;
    name: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const novel = await Novel.findById(params.id)
      .populate<{ author: PopulatedAuthor }>("author", "name")
      .lean();

    if (!novel) {
      return NextResponse.json(
        { error: "Novel not found" },
        { status: 404 }
      );
    }

    // Convert MongoDB ObjectIds to strings for proper JSON serialization
    const novelObj: SerializedNovel = {
      ...novel,
      _id: novel._id.toString(),
      author: novel.author ? {
        _id: novel.author._id.toString(),
        name: novel.author.name
      } : { _id: '', name: 'Unknown Author' }
    };

    if (novelObj.hasChapters && novelObj.chapters) {
      novelObj.chapters = novelObj.chapters.map((chapter: Chapter) => ({
        ...chapter,
        _id: chapter._id?.toString() || chapter._id
      }));
    }

    return NextResponse.json(novelObj);
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

    // Get the session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find the novel
    const novel = await Novel.findById(params.id);
    if (!novel) {
      return NextResponse.json(
        { error: "Novel not found" },
        { status: 404 }
      );
    }

    // Check if the user is the author of the novel
    if (!novel.author || novel.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this novel" },
        { status: 403 }
      );
    }

    // Get the update data from request body
    const body = await request.json();

    console.log('Received update data:', body);

    // Prepare update data
    const updateData = {
      title: body.title,
      synopsis: body.synopsis,
      genres: body.genres,
      hasChapters: body.hasChapters,
      ...(body.hasChapters 
        ? { chapters: body.chapters, content: undefined }
        : { content: body.content, chapters: [] }
      )
    };

    console.log('Updated data:', updateData);

    // Update the novel
    const updatedNovel = await Novel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "name");

    if (!updatedNovel) {
      return NextResponse.json(
        { error: "Failed to update novel" },
        { status: 400 }
      );
    }

    // Convert ObjectIds to strings for serialization
    const serializedNovel = {
      ...updatedNovel.toObject(),
      _id: updatedNovel._id.toString(),
      author: {
        _id: updatedNovel.author._id.toString(),
        name: updatedNovel.author.name
      }
    };

    return NextResponse.json(serializedNovel);
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

    // Get the session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find the novel
    const novel = await Novel.findById(params.id);
    if (!novel) {
      return NextResponse.json(
        { error: "Novel not found" },
        { status: 404 }
      );
    }

    // Check if the user is the author of the novel
    if (novel.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this novel" },
        { status: 403 }
      );
    }

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
