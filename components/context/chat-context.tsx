import React, { PropsWithChildren, useState } from 'react';
import { Channel as ChannelType } from 'stream-chat';

type AppContextType = {
  channel: ChannelType | undefined;
  setChannel: React.Dispatch<React.SetStateAction<ChannelType | undefined>>;
};
export const AppContext = React.createContext<AppContextType>({
  channel: undefined,
  setChannel: () => {},
});

export const ChatContext = ({ children }: PropsWithChildren) => {
  const [channel, setChannel] = useState<ChannelType | undefined>(undefined);

  return (
    <AppContext.Provider value={{ channel, setChannel }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppChatContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
