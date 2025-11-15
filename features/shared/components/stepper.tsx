import {
  Stepper,
  StepperButton,
  StepperContent,
  StepperValue,
} from '@/components/stepper';
import React from 'react';

type Props = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
};

export const StepperComponent = ({ count, setCount }: Props) => {
  return (
    <Stepper
      containerStyle={{
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 0,

        padding: 4,
      }}
      defaultValue={1}
      disabled={false}
      max={99}
      min={1}
      onChange={setCount}
      step={1}
      value={count}
      variant="light"
    >
      <StepperContent
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          borderWidth: 0,
        }}
      >
        <StepperButton
          type="decrement"
          style={{
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
        <StepperValue
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#000',
            minWidth: 60,
            textAlign: 'center',
            lineHeight: 44,
          }}
        />
        <StepperButton
          type="increment"
          style={{
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </StepperContent>
    </Stepper>
  );
};
