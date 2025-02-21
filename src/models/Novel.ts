import mongoose, { Model } from "mongoose";

export const NOVEL_GENRES = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Romance",
  "Thriller",
  "Horror",
  "Historical Fiction",
  "Literary Fiction",
  "Young Adult",
  "Adventure",
  "Drama",
  "Crime",
  "Comedy",
  "Other"
] as const;

export type NovelGenre = typeof NOVEL_GENRES[number];

export interface IChapterInfo {
  _id?: string;
  title: string;
  chapterNumber: number;
  content: string;
}

export interface IRating {
  userId: mongoose.Types.ObjectId;
  rating: number;
}

export interface INovel {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  title: string;
  synopsis: string;
  content: string;
  genres: NovelGenre[];
  status: "ongoing" | "completed" | "hiatus";
  coverImage?: string;
  hasChapters: boolean;
  chapters: IChapterInfo[];
  ratings: IRating[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Only include mongoose-specific code in a server context
let Novel: Model<INovel> | null = null;

if (mongoose.models && typeof window === 'undefined') {
  const ratingSchema = new mongoose.Schema<IRating>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
  });

  const novelSchema = new mongoose.Schema<INovel>(
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true },
      synopsis: { type: String, required: true },
      content: { type: String, required: true },
      genres: { type: [String], enum: NOVEL_GENRES, required: true },
      status: {
        type: String,
        enum: ["ongoing", "completed", "hiatus"],
        default: "ongoing",
      },
      coverImage: { type: String },
      hasChapters: { type: Boolean, default: false },
      chapters: [
        {
          title: { type: String, required: true },
          chapterNumber: { type: Number, required: true },
          content: { type: String, required: true },
        },
      ],
      ratings: [ratingSchema],
      averageRating: { type: Number, default: 0 },
    },
    {
      timestamps: true,
    }
  );

  // Create model if it doesn't exist
  Novel = mongoose.models.Novel || mongoose.model<INovel>("Novel", novelSchema);
}

export default Novel as Model<INovel>;
