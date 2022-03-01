import React, { FC } from 'react';

import NavBar from "../components/molecules/NavBar";
import { BrowserWindow } from "../components/organisms/BrowserWindow";


export const RecordPage: FC = () => (
    <div>
        <NavBar
            canMoveForward={true}
            canMoveBack={true}
            currentAddress={''}
            refresh={()=>{}} goBack={()=>{}} goForward={()=>{}} goTo={()=>{}}></NavBar>
        <BrowserWindow></BrowserWindow>
    </div>
);
