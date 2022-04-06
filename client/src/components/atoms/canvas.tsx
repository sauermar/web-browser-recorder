import React, {useCallback, useEffect, useRef} from 'react';
import { useSocketStore } from '../../context/socket';
import log from '../../api/loggerAPI';
import {ONE_PERCENT_OF_BROWSER_W, ONE_PERCENT_OF_BROWSER_H,
    ONE_PERCENT_OF_VIEWPORT_H, ONE_PERCENT_OF_VIEWPORT_W} from "../../constants/const";

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

const throttle = (callback: any, limit: number) => {
    let wait = false;
    return (...args: any[]) => {
        if (!wait) {
            callback(...args);
            wait = true;
            setTimeout(function () {
                wait = false;
            }, limit);
        }
    }
}

const mapPixelFromSmallerToLarger = (
  onePercentOfSmallerScreen: number,
  onePercentOfLargerScreen: number,
  pixel: number
) : number => {
    const xPercentOfScreen = pixel / onePercentOfSmallerScreen;
    return Math.round(xPercentOfScreen * onePercentOfLargerScreen);
};

const getMappedCoordinates = (event: MouseEvent, canvas: HTMLCanvasElement | null): Coordinates => {
    const clientCoordinates = getCoordinates(event, canvas);
    console.log(clientCoordinates);
    const mappedX = mapPixelFromSmallerToLarger(
      ONE_PERCENT_OF_BROWSER_W,
      ONE_PERCENT_OF_VIEWPORT_W,
      clientCoordinates.x,
    );
    const mappedY = mapPixelFromSmallerToLarger(
      ONE_PERCENT_OF_BROWSER_H,
      ONE_PERCENT_OF_VIEWPORT_H,
      clientCoordinates.y,
    );

    return {
        x: mappedX,
        y: mappedY
    };
};

const getCoordinates = (event: MouseEvent, canvas: HTMLCanvasElement | null): Coordinates => {
    if (!canvas) {
        return { x: 0, y: 0};
    }
    return {
        x: event.pageX - canvas.offsetLeft,
        y: event.pageY - canvas.offsetTop
    };
};

const Canvas = ({ width, height, onCreateRef }: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { socket } = useSocketStore();

    const lastMousePosition = useRef<Coordinates>({ x: 0, y: 0 });
     //const lastWheelPosition = useRef<ScrollDeltas>({ deltaX: 0, deltaY: 0 });

    const onMouseEvent = useCallback((event: MouseEvent) => {
        if (socket) {
            switch (event.type) {
                case 'mousedown':
                    console.log('click registered and emitted');
                    const clickCoordinates = getMappedCoordinates(event, canvasRef.current);
                    console.log(clickCoordinates);
                    socket.emit('input:mousedown', clickCoordinates);
                    break;
                case 'mousemove':
                    const coordinates = getMappedCoordinates(event, canvasRef.current);
                    if (lastMousePosition.current.x !== coordinates.x ||
                      lastMousePosition.current.y !== coordinates.y) {
                        log.debug('mousemove event registered');
                        lastMousePosition.current = coordinates;
                        socket.emit('input:mousemove', coordinates);
                    }
                    break;
                case 'wheel':
                    console.log('wheel canvas event registered');
                    const wheelEvent = event as WheelEvent;
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
        }
    }, [socket]);

    const onKeyboardEvent = useCallback((event: KeyboardEvent) => {
        if (socket) {
            switch (event.type) {
                case 'keydown':
                    console.log('Keydown event was triggered on canvas');
                    socket.emit('input:keydown', event.key);
                    break;
                case 'keyup':
                    console.log('Keyup event was triggered on canvas');
                    socket.emit('input:keyup', event.key);
                    break;
                default:
                    console.log('Default keyEvent registered');
                    return;
            }
        }
    }, [socket]);


    useEffect(() => {

        log.info('Effect from canvas');
        if (canvasRef.current) {
            onCreateRef(canvasRef);
            canvasRef.current.addEventListener('mousedown', onMouseEvent);
            canvasRef.current.addEventListener('mousemove', onMouseEvent);
            canvasRef.current.addEventListener('wheel', onMouseEvent, { passive: true });
            canvasRef.current.addEventListener('keydown', onKeyboardEvent);
            canvasRef.current.addEventListener('keyup', onKeyboardEvent);

            return () => {
                if (canvasRef.current) {
                    canvasRef.current.removeEventListener('mousedown', onMouseEvent);
                    canvasRef.current.addEventListener('mousemove', onMouseEvent);
                    canvasRef.current.removeEventListener('wheel', onMouseEvent);
                    canvasRef.current.addEventListener('keydown', onKeyboardEvent);
                    canvasRef.current.addEventListener('keyup', onKeyboardEvent);
                }

            };
        }else {
            console.log('Canvas not initialized');
        }

    }, [onMouseEvent]);

    return (
            <canvas tabIndex={0} ref={canvasRef}  height={height} width={width} />
    );

};


export default Canvas;
