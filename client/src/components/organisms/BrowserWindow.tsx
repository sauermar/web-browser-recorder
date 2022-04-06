import React, { useEffect, useState, useContext } from 'react';
import { useSocketStore } from '../../context/socket';
import Canvas from "../atoms/canvas";

export const VIEWPORT_W = 937;
export const VIEWPORT_H = 580;


export const BrowserWindow = () => {

    const [canvasRef, setCanvasReference] = useState<React.RefObject<HTMLCanvasElement> | undefined>(undefined);
    const [screenShot, setScreenShot] = useState<string>("");

    const { socket } = useSocketStore();

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

    return (
        <Canvas
            onCreateRef={setCanvasReference}
            width={VIEWPORT_W}
            height={VIEWPORT_H}
        />
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
