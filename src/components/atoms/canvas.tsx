import React, {useCallback, useEffect, useRef} from 'react';
import { useSocketStore } from '../../context/socket';
import log from '../../api/logger';
import { getMappedCoordinates } from "../../functions/inputHelpers";
import { useGlobalInfoStore } from "../../context/globalInfo";

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
export interface Coordinates {
    x: number;
    y: number;
};

const Canvas = ({ width, height, onCreateRef }: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { socket } = useSocketStore();
    const { setLastAction, lastAction } = useGlobalInfoStore();

    const notifyLastAction = (action: string) => {
        if (lastAction !== action) {
            setLastAction(action);
        }
    };

    const lastMousePosition = useRef<Coordinates>({ x: 0, y: 0 });
     //const lastWheelPosition = useRef<ScrollDeltas>({ deltaX: 0, deltaY: 0 });

    const onMouseEvent = useCallback((event: MouseEvent) => {
        if (socket) {
            switch (event.type) {
                case 'mousedown':
                    //console.log('click registered and emitted');
                    const clickCoordinates = getMappedCoordinates(event, canvasRef.current, width, height);
                    //console.log(clickCoordinates);
                    socket.emit('input:mousedown', clickCoordinates);
                    notifyLastAction('click');
                    break;
                case 'mousemove':
                    //TODO this should be throttled to avoid flooding the server
                    const coordinates = getMappedCoordinates(event, canvasRef.current, width, height);
                    if (lastMousePosition.current.x !== coordinates.x ||
                      lastMousePosition.current.y !== coordinates.y) {
                        //log.debug('mousemove event registered');
                        lastMousePosition.current = coordinates;
                        socket.emit('input:mousemove', coordinates);
                        notifyLastAction('move');
                    }
                    break;
                case 'wheel':
                    //console.log('wheel canvas event registered');
                    const wheelEvent = event as WheelEvent;
                    const deltas = {
                        deltaX: Math.round(wheelEvent.deltaX),
                        deltaY: Math.round(wheelEvent.deltaY),
                    };
                    //console.log(deltas);
                    socket.emit('input:wheel', deltas);
                    notifyLastAction('scroll');
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
                    socket.emit('input:keydown', { key: event.key, coordinates: lastMousePosition.current });
                    notifyLastAction(`${event.key} pressed`);
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
                    canvasRef.current.removeEventListener('mousemove', onMouseEvent);
                    canvasRef.current.removeEventListener('wheel', onMouseEvent);
                    canvasRef.current.removeEventListener('keydown', onKeyboardEvent);
                    canvasRef.current.removeEventListener('keyup', onKeyboardEvent);
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
