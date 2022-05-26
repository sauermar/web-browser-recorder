import React, { createContext, useContext, useState } from "react";
import { AlertSnackbarProps } from "../components/atoms/AlertSnackbar";


interface GlobalInfo {
  browserId: string | null;
  setBrowserId: (newId: string | null) => void;
  lastAction: string;
  setLastAction: (action: string ) => void;
  notification: AlertSnackbarProps;
  notify: (severity: 'error' | 'warning' | 'info' | 'success', message: string) => void;
  closeNotify: () => void;
  recordings: string[];
  setRecordings: (recordings: string[]) => void;
};

class GlobalInfoStore implements Partial<GlobalInfo>{
  browserId = null;
  lastAction = '';
  notification: AlertSnackbarProps = {
    severity: 'info',
    message: '',
    isOpen: false,
  };
  recordings: string[] = [];
};

const globalInfoStore = new GlobalInfoStore();
const globalInfoContext = createContext<GlobalInfo>(globalInfoStore as GlobalInfo);

export const useGlobalInfoStore = () => useContext(globalInfoContext);

export const GlobalInfoProvider = ({ children }: { children: JSX.Element }) => {
  const [browserId, setBrowserId] = useState<string | null>(globalInfoStore.browserId);
  const [lastAction, setLastAction] = useState<string>(globalInfoStore.lastAction);
  const [notification, setNotification] = useState<AlertSnackbarProps>(globalInfoStore.notification);
  const [recordings, setRecordings] = useState<string[]>(globalInfoStore.recordings);

  const notify = (severity: 'error' | 'warning' | 'info' | 'success', message: string) => {
    setNotification({severity, message, isOpen: true});
  }

  const closeNotify = () => {
    setNotification( globalInfoStore.notification);
  }

  return (
    <globalInfoContext.Provider
      value={{
        browserId,
        setBrowserId,
        lastAction,
        setLastAction,
        notification,
        notify,
        closeNotify,
        recordings,
        setRecordings,
      }}
    >
      {children}
    </globalInfoContext.Provider>
  );
};
