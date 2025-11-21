import { FiMapPin, FiCalendar, FiTrash2, FiEdit2, FiEye, FiPlay } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export default function PlanCard({ plan, onDelete, onEdit, onExecute }) {
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);
  const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
      {plan.coverImage && (
        <div className="h-40 bg-gray-200 overflow-hidden">
          <img
            src={plan.coverImage}
            alt={plan.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 flex-1 line-clamp-2">
            {plan.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
            plan.status === 'planning' ? 'bg-blue-100 text-blue-700' :
            plan.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
            plan.status === 'completed' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {plan.status}
          </span>
        </div>

        {plan.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiMapPin size={16} className="flex-shrink-0" />
            <span>{plan.destination.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiCalendar size={16} className="flex-shrink-0" />
            <span>
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {daysCount} days
            </span>
          </div>
        </div>

        {plan.activities?.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">
              Activities: {plan.activities.length}
            </p>
            <div className="flex flex-wrap gap-1">
              {plan.activities.slice(0, 3).map((activity, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {activity.name}
                </span>
              ))}
              {plan.activities.length > 3 && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  +{plan.activities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Link
            to={`/plan/view/${plan._id}`}
            className="flex-1 min-w-[80px] px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm flex items-center justify-center gap-2"
          >
            <FiEye size={16} />
            View
          </Link>
          {plan.status === 'planning' && onExecute && (
            <button
              onClick={onExecute}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-sm flex items-center gap-2"
              title="Start executing this plan"
            >
              <FiPlay size={16} />
              Execute
            </button>
          )}
          {plan.status === 'planning' && onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
              title="Edit plan"
            >
              <FiEdit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
              title="Delete plan"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
