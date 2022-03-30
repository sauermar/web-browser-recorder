import React, {FC, useEffect, useState} from 'react';

import NavBar from "../components/molecules/NavBar";
import { BrowserWindow } from "../components/organisms/BrowserWindow";
import { startRecording, stopRecording } from "../api/RemoteBrowserAPI";
import { useSocketStore } from "../context/socket";


export const RecordPage: FC = () => {
  const { setId } = useSocketStore();

    useEffect(() => {
        startRecording().then((id) => {
          setId(id);
          if (id) {
            // cleanup function when the component dismounts
            return () => {
              stopRecording(id);
          };
        }
      });
    }, [setId]);

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
