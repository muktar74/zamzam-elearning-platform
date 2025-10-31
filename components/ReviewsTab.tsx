
import React from 'react';
import { Review } from '../types';
import { StarIcon, UserCircleIcon } from './icons';

interface ReviewsTabProps {
  reviews: Review[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon 
                key={i} 
                className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-slate-300'}`}
            />
        ))}
    </div>
);

const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews }) => {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
                <StarIcon className="h-12 w-12 mx-auto text-slate-400" />
                <h4 className="text-lg font-semibold text-slate-700 mt-4">No Reviews Yet</h4>
                <p className="text-slate-500 mt-1">Be the first to complete the course and leave a review!</p>
            </div>
        );
    }
    
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
        const count = reviews.filter(r => r.rating === stars).length;
        const percentage = (count / reviews.length) * 100;
        return { stars, count, percentage };
    });

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Student Reviews</h3>
            <div className="flex flex-col md:flex-row gap-8 mb-8 p-6 border rounded-lg bg-slate-50">
                <div className="flex flex-col items-center justify-center">
                    <p className="text-5xl font-bold text-slate-800">{averageRating.toFixed(1)}</p>
                    <StarRating rating={Math.round(averageRating)} />
                    <p className="text-sm text-slate-600 mt-1">Based on {reviews.length} review{reviews.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex-grow">
                    {ratingDistribution.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-4 text-sm my-1">
                            <span className="text-slate-600 w-12">{stars} star{stars > 1 && 's'}</span>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-slate-600 w-8 text-right">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {reviews.map(review => (
                     <div key={review.id} className="flex space-x-4 border-b pb-6 last:border-b-0">
                        <UserCircleIcon className="h-10 w-10 text-slate-400 flex-shrink-0" />
                        <div className="flex-grow">
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800">{review.authorName}</p>
                                    <p className="text-xs text-slate-500">{new Date(review.timestamp).toLocaleDateString()}</p>
                                </div>
                                <StarRating rating={review.rating} />
                            </div>
                            <p className="text-slate-700 text-sm mt-2 prose max-w-none">{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewsTab;