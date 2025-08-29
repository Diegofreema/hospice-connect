import React from 'react';

import { Subtitle } from '@/components/subtitle/Subtitle';
import { ControlInput } from '@/features/authentication/components/form/control-input';
import { ControlSelect } from '@/features/authentication/components/form/control-select';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import View from '@/features/shared/components/view';
import { StepProps } from '../../validators';

export const License = ({ form }: StepProps) => {
  return (
    <View>
      <Spacer />
      <MyTitle title="License" />
      <Subtitle style={{ color: 'black' }}>
        Please ensure the accuracy of all Information
      </Subtitle>
      <Spacer height={50} />
      <View gap="m" mb="xl">
        <ControlSelect
          control={form.control}
          errors={form.formState.errors}
          name="discipline"
          placeholder="Select discipline"
          label="Discipline"
          items={disciplines}
        />
        <ControlSelect
          control={form.control}
          errors={form.formState.errors}
          name="licenseState"
          placeholder="Select a state"
          label="State of registration"
          items={usStates}
        />
        <ControlInput
          control={form.control}
          errors={form.formState.errors}
          name="licenseNumber"
          placeholder="Enter your license number"
          label="License Number"
        />
      </View>
    </View>
  );
};

const disciplines = [
  { label: 'RN', value: 'RN' },
  { label: 'LVN', value: 'LVN' },
  { label: 'HHA', value: 'HHA' },
];

const usStates = [
  { label: 'Alabama', value: 'alabama' },
  { label: 'Alaska', value: 'alaska' },
  { label: 'Arizona', value: 'arizona' },
  { label: 'Arkansas', value: 'arkansas' },
  { label: 'California', value: 'california' },
  { label: 'Colorado', value: 'colorado' },
  { label: 'Connecticut', value: 'connecticut' },
  { label: 'Delaware', value: 'delaware' },
  { label: 'Florida', value: 'florida' },
  { label: 'Georgia', value: 'georgia' },
  { label: 'Hawaii', value: 'hawaii' },
  { label: 'Idaho', value: 'idaho' },
  { label: 'Illinois', value: 'illinois' },
  { label: 'Indiana', value: 'indiana' },
  { label: 'Iowa', value: 'iowa' },
  { label: 'Kansas', value: 'kansas' },
  { label: 'Kentucky', value: 'kentucky' },
  { label: 'Louisiana', value: 'louisiana' },
  { label: 'Maine', value: 'maine' },
  { label: 'Maryland', value: 'maryland' },
  { label: 'Massachusetts', value: 'massachusetts' },
  { label: 'Michigan', value: 'michigan' },
  { label: 'Minnesota', value: 'minnesota' },
  { label: 'Mississippi', value: 'mississippi' },
  { label: 'Missouri', value: 'missouri' },
  { label: 'Montana', value: 'montana' },
  { label: 'Nebraska', value: 'nebraska' },
  { label: 'Nevada', value: 'nevada' },
  { label: 'New Hampshire', value: 'new_hampshire' },
  { label: 'New Jersey', value: 'new_jersey' },
  { label: 'New Mexico', value: 'new_mexico' },
  { label: 'New York', value: 'new_york' },
  { label: 'North Carolina', value: 'north_carolina' },
  { label: 'North Dakota', value: 'north_dakota' },
  { label: 'Ohio', value: 'ohio' },
  { label: 'Oklahoma', value: 'oklahoma' },
  { label: 'Oregon', value: 'oregon' },
  { label: 'Pennsylvania', value: 'pennsylvania' },
  { label: 'Rhode Island', value: 'rhode_island' },
  { label: 'South Carolina', value: 'south_carolina' },
  { label: 'South Dakota', value: 'south_dakota' },
  { label: 'Tennessee', value: 'tennessee' },
  { label: 'Texas', value: 'texas' },
  { label: 'Utah', value: 'utah' },
  { label: 'Vermont', value: 'vermont' },
  { label: 'Virginia', value: 'virginia' },
  { label: 'Washington', value: 'washington' },
  { label: 'West Virginia', value: 'west_virginia' },
  { label: 'Wisconsin', value: 'wisconsin' },
  { label: 'Wyoming', value: 'wyoming' },
];
