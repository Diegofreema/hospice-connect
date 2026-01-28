import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

type BannerType = 'info' | 'success' | 'error' | 'warning';

interface BannerProps {
  description: string;
  type?: BannerType;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

const Banner: React.FC<BannerProps> = ({
  description,
  type = 'info',
  onClose,
  style,
}) => {
  const getBackgroundColor = (): string => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text style={styles.description}>{description}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Banner;

// Usage Example:
/*
import React, { useState } from 'react';
import { View } from 'react-native';
import Banner from './Banner';

function App() {
  const [showBanner, setShowBanner] = useState<boolean>(true);

  return (
    <View style={{ padding: 20 }}>
      {showBanner && (
        <Banner 
          description="This is an information banner"
          type="info"
          onClose={() => setShowBanner(false)}
        />
      )}
      
      <Banner 
        description="Operation completed successfully!"
        type="success"
      />
      
      <Banner 
        description="Warning: Please check your input"
        type="warning"
      />
      
      <Banner 
        description="An error occurred. Please try again."
        type="error"
      />
    </View>
  );
}
*/
