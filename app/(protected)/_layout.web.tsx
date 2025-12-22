import { Slot } from 'expo-router';
import React from 'react';

const WebLayout = () => {
  return (
    <div style={{ flex: 1 }}>
      <Slot />;
    </div>
  );
};

export default WebLayout;
