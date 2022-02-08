import React, { useRef, useEffect } from 'react';

const VIEWPORT_W = 1280;
const VIEWPORT_H = 720;

interface BrowserWindowProps {
    screenShot: any;
}

export const BrowserWindow : React.FC<BrowserWindowProps> = ({ screenShot }: BrowserWindowProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() =>  {
        if (canvasRef.current) {
            drawImage(screenShot, canvasRef.current);
        } else {
            console.log('Canvas is not initialized');
        }
    }, [screenShot, canvasRef]);

    return (
        <canvas
            ref={canvasRef}
            tabIndex={-1}
            style={{ width: `${75}%`, height: `${75}vh` }}
            width={`${VIEWPORT_W}px`}
            height={`${VIEWPORT_H}px`}
        />
    );
};

const drawImage = (image: string, canvas: HTMLCanvasElement) :void => {
    const ctx = canvas.getContext('2d');

    console.log('DEBUG: Screenshot displayed');
    const img = new Image();

    img.src = image;
    img.onload = () => {
        URL.revokeObjectURL(img.src);
        //ctx?.clearRect(0, 0, canvas?.width || 0, VIEWPORT_H || 0);
        ctx?.drawImage(img, 0, 0, canvas.width , canvas.height);
    };
};
