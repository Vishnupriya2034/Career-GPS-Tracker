import React from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showValue?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 'md', 
  className,
  showValue = true
}) => {
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  // Determine the size of the stars
  const starSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];
  
  // Determine the text size for the rating value
  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];
  
  // Return null if rating is not a valid number
  if (isNaN(numericRating)) return null;
  
  // Create an array of 5 stars
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const isFilled = i < Math.floor(numericRating);
    
    return (
      <svg 
        key={i}
        xmlns="http://www.w3.org/2000/svg" 
        className={cn(starSize, isFilled ? "text-yellow-400" : "text-gray-300")} 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  });
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">{stars}</div>
      {showValue && <span className={cn("ml-1 text-gray-500", textSize)}>{numericRating}</span>}
    </div>
  );
};

export default StarRating;
