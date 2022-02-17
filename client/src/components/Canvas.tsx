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

const Canvas = ({ width, height, onCreateRef }: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socket = useContext(SocketContext);
    const [isOver, setIsOver] = useState(false);

    const lastMousePosition = useRef<Coordinates>({ x: 0, y: 0 });

    const onMouseEvent = useCallback((event: MouseEvent) => {
        switch (event.type){
            case 'mousedown':
                console.log('click registered and emitted');
                const coordinates = getCoordinates(event);
                console.log(coordinates);
                socket.emit('input:mousedown', coordinates);
                break;
            case 'mousemove':
                if (isOver) {
                    const coordinates = getCoordinates(event);
                    if (lastMousePosition.current.x !== coordinates.x ||
                        lastMousePosition.current.y !== coordinates.y) {
                        console.log('mousemove event registered');
                        lastMousePosition.current = coordinates;
                        socket.emit('input:mousemove', coordinates);
                    }
                }
                break;
            case 'mouseover':
                console.log('mouseover canvas event registered');
                setIsOver(true);
                break;
            case 'mouseout':
                console.log('mouseout canvas event registered');
                setIsOver(false);
                break;
            default:
                console.log('Default mouseEvent registered');
                return;
        }
    }, [isOver]);

    const onEvent = useCallback((event: Event) => {
        console.log('scroll registered and emitted');

    socket.emit('input:scroll', {
        deltaX: canvasRef.current!.scrollTop,
        deltaY: canvasRef.current!.scrollLeft
    });

    }, []);


    useEffect(() => {

        console.log('Effect from canvas');
        if (canvasRef.current) {
            onCreateRef(canvasRef);
            canvasRef.current.addEventListener('mousedown', onMouseEvent);
            canvasRef.current.addEventListener('mousemove', onMouseEvent);
            canvasRef.current.addEventListener('mouseover', onMouseEvent);
            canvasRef.current.addEventListener('mouseout', onMouseEvent);
            //canvasRef.current.addEventListener('scroll', onEvent, { passive: true });

            return () => {
                if (canvasRef.current) {
                    canvasRef.current.removeEventListener('mousedown', onMouseEvent);
                    canvasRef.current.addEventListener('mousemove', onMouseEvent);
                    canvasRef.current.addEventListener('mouseover', onMouseEvent);
                    canvasRef.current.addEventListener('mouseout', onMouseEvent);
                    //canvasRef.current.removeEventListener('scroll', onEvent);
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
        <div style={{
            overflow: "scroll",
            border: "1px solid black",
            height: "1500",
            width: "2000",
        }}>
            <canvas ref={canvasRef}  height={height} width={width} />
        </div>
    );

};

Canvas.defaultProps = {

    width: window.innerWidth,

    height: window.innerHeight,

};


export default Canvas;
