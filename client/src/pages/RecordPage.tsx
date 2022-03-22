import React, {FC, useEffect, useState} from 'react';

import NavBar from "../components/molecules/NavBar";
import { BrowserWindow } from "../components/organisms/BrowserWindow";
import { startRecording, stopRecording } from "../api/RemoteBrowserAPI";
import { SocketProvider } from "../context/socket";


export const RecordPage: FC = () => {

    const [id, setId] = useState<string>('');

    useEffect(() => {
        const id = startRecording();
        setId(id);
        if (id) {
            // cleanup function when the component dismounts
            return () => {
                stopRecording(id);
            };
        }
    }, []);

    return (
        <SocketProvider id={id}>
            <div>
                <NavBar
                    initialAddress={'https://'}
                >
                </NavBar>
                <BrowserWindow></BrowserWindow>
            </div>
        </SocketProvider>
    );
};
