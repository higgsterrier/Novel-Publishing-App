import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Novel from '@/models/Novel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string; chapterNumber: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id, chapterNumber } = params;

    // First check if the novel exists and if the user has access to it
    const novel = await Novel.findById(id).lean();
    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }

    // Find the chapter by novel ID and chapter number
    const chapterIndex = parseInt(chapterNumber) - 1; // Convert to 0-based index
    
    if (!novel.chapters || !Array.isArray(novel.chapters)) {
      return NextResponse.json({ error: 'No chapters found for this novel' }, { status: 404 });
    }
    
    const chapter = novel.chapters[chapterIndex];

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json({
      title: chapter.title,
      content: chapter.content,
      chapterNumber: chapter.chapterNumber
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}
