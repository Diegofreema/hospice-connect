import React from 'react';

type Props = {
  message: string;
};

export const Loader = ({ message }: Props) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        <p className="mt-4 text-muted-foreground">{message}...</p>
      </div>
    </div>
  );
};
