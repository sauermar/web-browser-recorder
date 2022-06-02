import React, { useEffect, useState } from 'react';
import { useSocketStore } from '../../context/socket';
import Canvas from "../atoms/canvas";
import { useBrowserDimensionsStore } from "../../context/browserDimensions";
import { Highlighter } from "../atoms/Highlighter";

export const BrowserWindow = () => {

    const [canvasRef, setCanvasReference] = useState<React.RefObject<HTMLCanvasElement> | undefined>(undefined);
    const [screenShot, setScreenShot] = useState<string>("");
    const [highlighterData, setHighlighterData] = useState<{rect: DOMRect, selector: string} | null>(null);

    const { socket } = useSocketStore();
    const { width, height } = useBrowserDimensionsStore();

    useEffect(() =>  {
        console.log('Effect from BrWindow');

        if (socket) {
            socket.on("screencast", data => {
                setScreenShot(data);
            });
        }

        if (canvasRef?.current) {
            drawImage(screenShot, canvasRef.current);
        } else {
            console.log('Canvas is not initialized');
        }

    }, [screenShot, canvasRef, socket]);


    useEffect(() =>  {
        console.log('Effect from BrWindow');
        if (socket) {
            socket.on("highlighter", data => {
                setHighlighterData(data);
            });
        }
    }, [socket]);

    return (
      <>
          {(highlighterData?.rect != null && highlighterData?.rect.top != null) ?
            <Highlighter
              unmodifiedRect={highlighterData?.rect}
              displayedSelector={highlighterData?.selector}
              width={width}
              height={height}
              canvas={canvasRef?.current || null}
            />
            : null }
        <Canvas
            onCreateRef={setCanvasReference}
            width={width}
            height={height}
        />
      </>
    );
};

const drawImage = (image: string, canvas: HTMLCanvasElement) :void => {

    const ctx = canvas.getContext('2d');

    const img = new Image();

    img.src = image;
    img.onload = () => {
        URL.revokeObjectURL(img.src);
        //ctx?.clearRect(0, 0, canvas?.width || 0, VIEWPORT_H || 0);
        ctx?.drawImage(img, 0, 0, canvas.width , canvas.height);
    };

};
