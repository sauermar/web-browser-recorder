import React, {useCallback, useEffect, useRef, useState} from 'react';

interface CreateRefCallback {

    (ref: React.RefObject<HTMLCanvasElement>): void;

}

interface CanvasProps {

    width: number;

    height: number;

    onCreateRef: CreateRefCallback;

}

/**
 * Interface for mouse's x,y coordinates
 */
interface Coordinate {

    x: number;

    y: number;

};



const Canvas = ({ width, height, onCreateRef }: CanvasProps) => {

    const [clicked, setClicked] = useState(false);
    const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(undefined);

    const startInteraction = useCallback((event: MouseEvent) => {

        const coordinates = getCoordinates(event);

        if (coordinates) {

            setClicked(true);

            setMousePosition(coordinates);

        }

    }, []);


    useEffect(() => {

        if (!canvasRef.current) {

            return;

        }

        const canvas: HTMLCanvasElement = canvasRef.current;

        canvas.addEventListener('mousedown', startInteraction);

        return () => {

            canvas.removeEventListener('mousedown', startInteraction);

        };

    }, [startInteraction]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    onCreateRef(canvasRef);

    const getCoordinates = (event: MouseEvent): Coordinate | undefined => {

        if (!canvasRef.current) {

            return;

        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        return {
            x: event.pageX - canvas.offsetLeft,
            y: event.pageY - canvas.offsetTop
        };
    };

    return <canvas ref={canvasRef} height={height} width={width} />;

};

Canvas.defaultProps = {

    width: window.innerWidth,

    height: window.innerHeight,

};


export default Canvas;
