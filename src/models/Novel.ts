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

export interface INovel {
  _id: string;
  title: string;
  synopsis: string;
  content?: string;
  genres: NovelGenre[];
  author: {
    _id: string;
    name: string;
  };
  ratings?: {
    totalScore: number;
    count: number;
  };
  coverImage?: string;
  hasChapters: boolean;
  chapters?: IChapterInfo[];
  createdAt: Date;
  updatedAt: Date;
}

// Only include mongoose-specific code in a server context
let Novel: Model<INovel> | null = null;

if (mongoose.models && typeof window === 'undefined') {
  const NovelSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, "Please provide a title"],
        maxlength: [100, "Title cannot be more than 100 characters"],
      },
      synopsis: {
        type: String,
        required: [true, "Please provide a synopsis"],
        maxlength: [2000, "Synopsis cannot be more than 2000 characters"],
      },
      content: {
        type: String,
        default: undefined
      },
      author: {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        name: {
          type: String,
          required: true,
        }
      },
      ratings: {
        totalScore: {
          type: Number,
          default: 0,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
      genres: [{
        type: String,
        enum: NOVEL_GENRES,
        required: true,
      }],
      coverImage: {
        type: String,
      },
      hasChapters: {
        type: Boolean,
        default: false,
      },
      chapters: [{
        title: String,
        chapterNumber: Number,
        content: String,
      }],
    },
    {
      timestamps: true,
    }
  );

  Novel = mongoose.models.Novel || mongoose.model<INovel>("Novel", NovelSchema);
}

export default Novel as Model<INovel>;
