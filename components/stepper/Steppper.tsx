import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { StepperContext } from './context/StepperContext';

import Animated, { LinearTransition } from 'react-native-reanimated';
import type { StepperProps } from './Stepper.types';

export const Stepper: React.FC<StepperProps> = ({
  children,
  value: controlledValue,
  onChange: controlledOnChange,
  defaultValue = 0,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  variant = 'light',
  style,
  containerStyle,
}: StepperProps): React.ReactNode => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (newValue: number) => {
      const clampedValue = Math.min(Math.max(newValue, min), max);

      if (!isControlled) {
        setInternalValue(clampedValue);
      }

      controlledOnChange?.(clampedValue);
    },
    [controlledOnChange, isControlled, min, max]
  );

  const contextValue = useMemo(
    () => ({
      value,
      onChange: handleChange,
      min,
      max,
      step,
      disabled,
      variant,
    }),
    [value, handleChange, min, max, step, disabled, variant]
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <Animated.View
        style={[styles.container, containerStyle]}
        layout={LinearTransition.springify().damping(14).stiffness(100)}
      >
        <Animated.View
          layout={LinearTransition.springify().damping(14).stiffness(100)}
          style={[styles.stepper, style, variant === 'dark' && styles.darkMode]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </StepperContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 4,
    maxWidth: 150,
  },
  darkMode: {
    backgroundColor: '#121212',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
