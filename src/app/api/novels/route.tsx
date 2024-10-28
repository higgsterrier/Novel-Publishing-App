import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Novel from "@/models/Novel";
import { protect } from "@/lib/auth";

export async function GET() {
  await dbConnect();

  const novels = await Novel.find().populate("author", "name");
  return NextResponse.json(novels);
}

export async function POST(request: NextRequest) {
  await dbConnect();

  const user = await protect(request);
  if (!(user instanceof NextResponse)) {
    const body = await request.json();
    const { title, synopsis, content } = body;

    const novel = await Novel.create({
      title,
      synopsis,
      content,
      author: user._id,
    });

    return NextResponse.json(novel);
  } else {
    return user; // This is the error response from protect middleware
  }
}
