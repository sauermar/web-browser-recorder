import React, { useCallback, useEffect, useState } from 'react';
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

    const onMouseMove = (e: MouseEvent) =>{
        if (canvasRef && canvasRef.current && highlighterData) {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            // mousemove outside the browser window
            if (
              e.pageX < canvasRect.left
              || e.pageX > canvasRect.right
              || e.pageY < canvasRect.top
              || e.pageY > canvasRect.bottom
            ){
                setHighlighterData(null);
            }
        }
    };

    const screencastHandler = useCallback((data: string) => {
        setScreenShot(data);
    }, [screenShot]);

    useEffect(() =>  {
        if (socket) {
            socket.on("screencast", screencastHandler);
        }
        if (canvasRef?.current) {
            drawImage(screenShot, canvasRef.current);
        } else {
            console.log('Canvas is not initialized');
        }
        return () => {
            socket?.off("screencast", screencastHandler);
        }

    }, [screenShot, canvasRef, socket, screencastHandler]);


    const highlighterHandler = useCallback((data: {rect: DOMRect, selector: string}) => {
        setHighlighterData(data);
    }, [highlighterData])

    useEffect(() =>  {
        document.addEventListener('mousemove', onMouseMove, false);
        if (socket) {
            socket.on("highlighter", highlighterHandler);
        }
        //cleaning function
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            socket?.off("highlighter", highlighterHandler);
        };
    }, [socket, onMouseMove]);

    return (
      <>
          {(highlighterData?.rect != null && highlighterData?.rect.top != null) && canvasRef?.current ?
            <Highlighter
              unmodifiedRect={highlighterData?.rect}
              displayedSelector={highlighterData?.selector}
              width={width}
              height={height}
              canvasRect={canvasRef.current.getBoundingClientRect()}
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
