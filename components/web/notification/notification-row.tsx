import { Button } from '@/components/web/ui/button';
import type { Id } from '@/convex/_generated/dataModel';
import { formatString } from '@/lib/utils';
import { Eye, Trash2 } from 'lucide-react-native';

interface NotificationRowProps {
  id: Id<'adminNotifications'>;
  title: string;

  //   targetType: string;
  type: 'nurse' | 'hospice';
  sentDate: number;
  onView: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  name: string;
  email: string;
}

export function NotificationRow({
  title,

  //   targetType,
  name,
  email,
  type,
  sentDate,
  onView,
  onDelete,
  isDeleting,
}: NotificationRowProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'notification':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'news_alert':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'announcement':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getTargetLabel = (target: string) => {
    const labels: Record<string, string> = {
      all_nurses: 'All Nurses',
      all_hospices: 'All Hospices',
      by_state: 'By State',
      by_discipline: 'By Discipline',
      selected_nurses: 'Selected Nurses',
      selected_hospices: 'Selected Hospices',
    };
    return labels[target] || target;
  };

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3 font-medium text-sm truncate max-w-xs">
        {title}
      </td>
      <td className="px-4 py-3 font-medium text-sm truncate max-w-xs">
        {formatString(type)}
      </td>
      <td className="px-4 py-3 font-medium text-sm truncate max-w-xs">
        {formatString(name)}
      </td>
      <td className="px-4 py-3 font-medium text-sm truncate max-w-xs">
        {email}
      </td>

      {/* <td className="px-4 py-3 text-sm">{getTargetLabel(targetType)}</td> */}

      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(sentDate).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>
      <td className="px-4 py-3 flex gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          className="h-8 w-8 p-0"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-600"
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
