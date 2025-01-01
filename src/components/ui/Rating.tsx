"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  initialRating?: number;
  totalRatings?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({
  initialRating = 0,
  totalRatings,
  onRate,
  readonly = false,
  size = "md",
  className,
}: RatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleClick = (value: number) => {
    if (!readonly) {
      setRating(value);
      onRate?.(value);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoveredRating(value)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
            className={cn(
              "transition-colors",
              !readonly && "cursor-pointer hover:text-yellow-400",
              readonly && "cursor-default"
            )}
            disabled={readonly}
          >
            <Star
              className={cn(
                sizes[size],
                (value <= (hoveredRating || rating)) && "fill-yellow-400 text-yellow-400",
                value > (hoveredRating || rating) && "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>
      {totalRatings !== undefined && (
        <span className="text-sm text-gray-500">
          {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
        </span>
      )}
    </div>
  );
}
