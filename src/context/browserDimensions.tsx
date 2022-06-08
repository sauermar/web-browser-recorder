import React, { createContext, useCallback, useContext, useState } from "react";
import { useSocketStore } from "./socket";

interface BrowserDimensions {
  width: number;
  height: number;
  setWidth: (newWidth: number) => void;
};

class BrowserDimensionsStore implements Partial<BrowserDimensions>{
  width: number = 936;
  height: number = Math.round(this.width / 1.6);
};

const browserDimensionsStore = new BrowserDimensionsStore();
const browserDimensionsContext = createContext<BrowserDimensions>(browserDimensionsStore as BrowserDimensions);

export const useBrowserDimensionsStore = () => useContext(browserDimensionsContext);

export const BrowserDimensionsProvider = ({ children }: { children: JSX.Element }) => {
  const [width, setWidth] = useState<number>(browserDimensionsStore.width);
  const [height, setHeight] = useState<number>(browserDimensionsStore.height);

  const { socket } = useSocketStore();

  const setNewWidth = useCallback((newWidth: number) => {
    setWidth(newWidth);
    setHeight(Math.round(newWidth / 1.6));
    socket?.emit("rerender");
    console.log("rerender emmited");
  }, [setWidth, setHeight]);

  return (
    <browserDimensionsContext.Provider
      value={{
        width,
        height,
        setWidth: setNewWidth,
      }}
    >
      {children}
    </browserDimensionsContext.Provider>
  );
};
