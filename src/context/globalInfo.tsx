import React, { createContext, useContext, useState } from "react";

interface GlobalInfo {
  browserId: string | null;
  setBrowserId: (newId: string | null) => void;
  lastAction: string;
  setLastAction: (action: string ) => void;
};

class GlobalInfoStore implements Partial<GlobalInfo>{
  browserId: string | null = null;
  lastAction: string = '';
};

const globalInfoStore = new GlobalInfoStore();
const globalInfoContext = createContext<GlobalInfo>(globalInfoStore as GlobalInfo);

export const useGlobalInfoStore = () => useContext(globalInfoContext);

export const GlobalInfoProvider = ({ children }: { children: JSX.Element }) => {
  const [browserId, setBrowserId] = useState<string | null>(globalInfoStore.browserId);
  const [lastAction, setLastAction] = useState<string>(globalInfoStore.lastAction);

  return (
    <globalInfoContext.Provider
      value={{
        browserId,
        setBrowserId,
        lastAction,
        setLastAction
      }}
    >
      {children}
    </globalInfoContext.Provider>
  );
};
