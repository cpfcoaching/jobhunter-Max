import React from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    onRate?: (rating: number) => void;
    readOnly?: boolean;
    size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 3,
    onRate,
    readOnly = false,
    size = 20,
}) => {
    return (
        <div className="flex gap-1">
            {Array.from({ length: maxRating }).map((_, index) => {
                const value = index + 1;
                // Check if the star is fully filled or partially (though 0.5 is handled by logic elsewhere, visual distinction for star might be just full/empty for now, user asked for 0-3 int scale mostly but effectively 0.5 subtraction.
                // Let's stick to full stars for setting rating, but maybe display could handle half? 
                // For simplicity, let's keep input as integer 0-3.
                const filled = value <= Math.ceil(rating);

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readOnly}
                        onClick={() => onRate?.(value === rating ? 0 : value)} // Toggle off if clicking current rating?? Or just set value.
                        className={clsx(
                            'transition-colors focus:outline-none',
                            readOnly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-400',
                            filled ? 'text-yellow-400' : 'text-gray-600'
                        )}
                    >
                        <Star size={size} fill={filled ? 'currentColor' : 'none'} />
                    </button>
                );
            })}
        </div>
    );
};
