import React, { FC } from 'react';

import NavBar from "../components/molecules/NavBar";
import { BrowserWindow } from "../components/organisms/BrowserWindow";


export const RecordPage: FC = () => (
    <div>
        <NavBar
            canMoveForward={true}
            canMoveBack={true}
            // about:blank is an empty page which is the first getting displayed - will not be in the recording
            currentAddress={'about:blank'}
            refresh={()=>{}}
            goBack={()=>{}}
            goForward={()=>{}}
            goTo={()=>{}}></NavBar>
        <BrowserWindow></BrowserWindow>
    </div>
);
