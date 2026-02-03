import { Badge } from '@/components/web/ui/badge';

interface FieldDiffProps {
  label: string;
  original: string | number | boolean | undefined;
  updated: string | number | boolean | undefined;
}

export function FieldDiff({ label, original, updated }: FieldDiffProps) {
  const hasChanged = original !== updated;

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hasChanged && (
          <Badge
            variant="outline"
            className="bg-yellow-50 border-yellow-200 text-yellow-800"
          >
            Updated
          </Badge>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p
            className={`text-sm ${!original ? 'text-muted-foreground italic' : ''}`}
          >
            {original || '(empty)'}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">New</p>
          <p
            className={`text-sm ${hasChanged ? 'font-semibold text-foreground' : 'text-muted-foreground italic'}`}
          >
            {updated || '(empty)'}
          </p>
        </div>
      </div>
    </div>
  );
}
