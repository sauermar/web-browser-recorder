import {BrowserType, LaunchOptions} from "playwright";

export interface Coordinates {
    x: number;
    y: number;
}

export interface ScrollDeltas {
    deltaX: number;
    deltaY: number;
}

export interface RemoteBrowserOptions {
    browser: BrowserType
    launchOptions: LaunchOptions
};

export interface KeyboardInput {
    key: string;
    coordinates: Coordinates;
}
