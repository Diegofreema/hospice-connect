'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

type TargetType = 'all_nurses' | 'all_hospices' | 'by_state' | 'by_discipline';

interface TargetSelectorProps {
  targetType: TargetType;
  onTargetTypeChange: (type: TargetType) => void;
  selectedStates?: string[];
  onStatesChange?: (states: string[]) => void;
  selectedDisciplines?: string[];
  onDisciplinesChange?: (disciplines: string[]) => void;
}

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];
const DISCIPLINES = ['RN', 'LVN', 'HHA', 'PT', 'OT'];

export function TargetSelector({
  targetType,
  onTargetTypeChange,
  selectedStates = [],
  onStatesChange,
  selectedDisciplines = [],
  onDisciplinesChange,
}: TargetSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="target-type">Send To</Label>
        <Select
          value={targetType}
          onValueChange={(value) => onTargetTypeChange(value as TargetType)}
        >
          <SelectTrigger id="target-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_nurses">All Nurses</SelectItem>
            <SelectItem value="all_hospices">All Hospices</SelectItem>
            <SelectItem value="by_state">By State (Nurses)</SelectItem>
            <SelectItem value="by_discipline">
              By Discipline (Nurses)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {targetType === 'by_state' && (
        <div className="space-y-2">
          <Label>Select States</Label>
          <Card className="p-3">
            <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {US_STATES.map((state) => (
                <div key={state} className="flex items-center space-x-2">
                  <Checkbox
                    id={`state-${state}`}
                    checked={selectedStates.includes(state)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onStatesChange?.([...selectedStates, state]);
                      } else {
                        onStatesChange?.(
                          selectedStates.filter((s) => s !== state)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`state-${state}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {state}
                  </Label>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {targetType === 'by_discipline' && (
        <div className="space-y-2">
          <Label>Select Disciplines</Label>
          <Card className="p-3">
            <div className="grid grid-cols-2 gap-3">
              {DISCIPLINES.map((discipline) => (
                <div key={discipline} className="flex items-center space-x-2">
                  <Checkbox
                    id={`discipline-${discipline}`}
                    checked={selectedDisciplines.includes(discipline)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onDisciplinesChange?.([
                          ...selectedDisciplines,
                          discipline,
                        ]);
                      } else {
                        onDisciplinesChange?.(
                          selectedDisciplines.filter((d) => d !== discipline)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`discipline-${discipline}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {discipline}
                  </Label>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
