import React, { FC, useEffect } from 'react';

import NavBar from "../components/molecules/NavBar";
import { BrowserWindow } from "../components/organisms/BrowserWindow";
import { startRecording, stopRecording } from "../RemoteBrowserAPI";


export const RecordPage: FC = () => {

    useEffect(() => {
        const id = startRecording();
        if (id) {
            // cleanup function when the component dismounts
            return () => {
                stopRecording(id);
            };
        }
    }, []);

    return (
        <div>
            <NavBar
                initialAddress={'https://'}
            >
            </NavBar>
            <BrowserWindow></BrowserWindow>
        </div>
    );
};
