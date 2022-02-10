import React, { useEffect, useState } from 'react';
import Canvas from "./Canvas";

const VIEWPORT_W = 1280;
const VIEWPORT_H = 720;

interface BrowserWindowProps {

    screenShot: string;

}

export const BrowserWindow : React.FC<BrowserWindowProps> = ({ screenShot }: BrowserWindowProps) => {

    const [canvasRef, setCanvasReference] = useState<React.RefObject<HTMLCanvasElement> | undefined>(undefined);

    useEffect(() =>  {

        if (canvasRef?.current) {

            drawImage(screenShot, canvasRef.current);

        } else {

            console.log('Canvas is not initialized');

        }

    }, [screenShot, canvasRef]);

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
