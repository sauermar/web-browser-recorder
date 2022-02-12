import React, { useCallback, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/socket';

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

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socket = useContext(SocketContext);

    const startInteraction = useCallback((event: MouseEvent) => {
        console.log('click registered and emitted');

        const coordinates = getCoordinates(event);

        console.log(coordinates);

        socket.emit(
            'interaction',
            {
            event,
            coordinates
        });

    }, []);


    useEffect(() => {

        console.log('Effect from canvas');
        if (canvasRef.current) {
            onCreateRef(canvasRef);
            canvasRef.current.addEventListener('mousedown', startInteraction);

            return () => {
                if (canvasRef.current) {
                    canvasRef.current.removeEventListener('mousedown', startInteraction);
                }

            };
        }else {
            console.log('Canvas not initialized');
        }

    }, [startInteraction]);

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
