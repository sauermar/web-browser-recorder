import React, {useCallback, useEffect, useRef, useContext, useState} from 'react';
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
interface Coordinates {
    x: number;
    y: number;
};

interface ScrollDeltas {
    deltaX: number;
    deltaY: number;
}

const Canvas = ({ width, height, onCreateRef }: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socket = useContext(SocketContext);

    const lastMousePosition = useRef<Coordinates>({ x: 0, y: 0 });
    const lastWheelPosition = useRef<ScrollDeltas>({ deltaX: 0, deltaY: 0 });

    const onMouseEvent = useCallback((event: MouseEvent) => {
        switch (event.type){
            case 'mousedown':
                console.log('click registered and emitted');
                const clickCoordinates = getCoordinates(event);
                console.log(clickCoordinates);
                socket.emit('input:mousedown', clickCoordinates);
                break;
            case 'mousemove':
                const coordinates = getCoordinates(event);
                if (lastMousePosition.current.x !== coordinates.x ||
                    lastMousePosition.current.y !== coordinates.y) {
                    console.log('mousemove event registered');
                    lastMousePosition.current = coordinates;
                    socket.emit('input:mousemove', coordinates);
                }
                break;
            case 'wheel':
                console.log('wheel canvas event registered');
                const wheelEvent= event as WheelEvent;
                const deltas = {
                    deltaX: Math.round(wheelEvent.deltaX),
                    deltaY: Math.round(wheelEvent.deltaY),
                };
                console.log(deltas);
                socket.emit('input:wheel', deltas);
                break;
            default:
                console.log('Default mouseEvent registered');
                return;
        }
    }, []);


    useEffect(() => {

        console.log('Effect from canvas');
        if (canvasRef.current) {
            onCreateRef(canvasRef);
            canvasRef.current.addEventListener('mousedown', onMouseEvent);
            canvasRef.current.addEventListener('mousemove', onMouseEvent);
            canvasRef.current.addEventListener('wheel', onMouseEvent, { passive: true });

            return () => {
                if (canvasRef.current) {
                    canvasRef.current.removeEventListener('mousedown', onMouseEvent);
                    canvasRef.current.addEventListener('mousemove', onMouseEvent);
                    canvasRef.current.removeEventListener('wheel', onMouseEvent);
                }

            };
        }else {
            console.log('Canvas not initialized');
        }

    }, [onMouseEvent]);

    const getCoordinates = (event: MouseEvent): Coordinates => {
        if (!canvasRef.current) {
            return { x: 0, y: 0};
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        return {
            x: event.pageX - canvas.offsetLeft,
            y: event.pageY - canvas.offsetTop
        };
    };

    return (
            <canvas ref={canvasRef}  height={height} width={width} />
    );

};

Canvas.defaultProps = {

    width: window.innerWidth,

    height: window.innerHeight,

};


export default Canvas;
