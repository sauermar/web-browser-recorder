import React, { createContext, useContext, useState } from "react";

interface GlobalInfo {
  browserId: string | null;
  setBrowserId: (newId: string | null) => void;
};

class GlobalInfoStore implements Partial<GlobalInfo>{
  browserId: string | null = null;
};

const globalInfoStore = new GlobalInfoStore();
const globalInfoContext = createContext<GlobalInfo>(globalInfoStore as GlobalInfo);

export const useGlobalInfoStore = () => useContext(globalInfoContext);

export const GlobalInfoProvider = ({ children }: { children: JSX.Element }) => {
  const [browserId, setBrowserId] = useState<string | null>(globalInfoStore.browserId);

  return (
    <globalInfoContext.Provider
      value={{
        browserId,
        setBrowserId,
      }}
    >
      {children}
    </globalInfoContext.Provider>
  );
};
