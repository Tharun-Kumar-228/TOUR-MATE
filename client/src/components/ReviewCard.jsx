import { FiStar, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewCard({ review, onEdit, onDelete, isOwn = false }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{review.user?.name}</h4>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </p>
        </div>

        {isOwn && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
              >
                <FiEdit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700 mb-3">{review.review}</p>

      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {review.images.map((image, idx) => (
            <img
              key={idx}
              src={image}
              alt={`Review ${idx}`}
              className="h-20 w-20 object-cover rounded-lg flex-shrink-0"
            />
          ))}
        </div>
      )}

      {review.isVerified && (
        <div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
          ✓ Verified Purchase
        </div>
      )}
    </div>
  );
}
