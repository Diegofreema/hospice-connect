'use client';

import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Briefcase } from 'lucide-react';

interface RecipientEntity {
  type: 'nurse' | 'hospice';
  id: string;
  name: string;
  email: string;
  phone?: string;
  discipline?: string;
  address?: string;
}

interface RecipientInfoCardProps {
  entity: RecipientEntity;
  isRead: boolean;
}

export function RecipientInfoCard({ entity, isRead }: RecipientInfoCardProps) {
  return (
    <div className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <Badge
            variant={entity.type === 'nurse' ? 'default' : 'secondary'}
            className="w-fit"
          >
            {entity.type === 'nurse' ? 'Nurse' : 'Hospice'}
          </Badge>
          <p className="font-medium text-sm">{entity.name}</p>
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            <a
              href={`mailto:${entity.email}`}
              className="hover:text-foreground"
            >
              {entity.email}
            </a>
          </div>

          {entity.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <a href={`tel:${entity.phone}`} className="hover:text-foreground">
                {entity.phone}
              </a>
            </div>
          )}

          {entity.type === 'nurse' && entity.discipline && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              <span>{entity.discipline}</span>
            </div>
          )}

          {entity.type === 'hospice' && entity.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>{entity.address}</span>
            </div>
          )}
        </div>
      </div>

      <Badge variant={isRead ? 'secondary' : 'default'} className="ml-2">
        {isRead ? 'Read' : 'Unread'}
      </Badge>
    </div>
  );
}
