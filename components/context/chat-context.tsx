import React, { PropsWithChildren, useState } from 'react';
import { Channel } from 'stream-chat-expo';

type ChannelType = typeof Channel | null;
type AppContextType = {
  channel: ChannelType;
  setChannel: (channel: ChannelType) => void;
};
export const AppContext = React.createContext<AppContextType>({
  channel: null,
  setChannel: () => {},
});

export const ChatContext = ({ children }: PropsWithChildren) => {
  const [channel, setChannel] = useState<ChannelType>(null);

  return (
    <AppContext.Provider value={{ channel, setChannel }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
