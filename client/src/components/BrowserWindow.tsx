import React, { Component, createRef } from 'react';

const VIEWPORT_W = 1280;
const VIEWPORT_H = 720;

export class BrowserWindow extends Component<any, any> {

    private canvasRef : React.RefObject<HTMLCanvasElement>;


    constructor(props : any) {
        super(props);

        this.canvasRef = createRef();
    }

    public DrawImage = (image: Buffer) :void => {
        if (this.canvasRef.current) {
            const ctx = this.canvasRef.current.getContext('2d');

            const img = new Image();

            img.src = URL.createObjectURL(new Blob([image]));
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                ctx?.clearRect(0, 0, this.canvasRef.current?.width || 0, VIEWPORT_H || 0);
                ctx?.drawImage(img, 0, 0);
            };
        }
    };

    render() : JSX.Element {
        return (
            <canvas
                ref={this.canvasRef}
                tabIndex={-1}
                style={{ width: `${100}%`, height: `${75}vh` }}
                width={`${VIEWPORT_W}px`}
                height={`${VIEWPORT_H}px`}
            />
        );
    }
};
