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

export enum ActionType {
    AwaitText = 'awaitText',
    Click = 'click',
    DragAndDrop = 'dragAndDrop',
    Screenshot = 'screenshot',
    Hover = 'hover',
    Input = 'input',
    Keydown = 'keydown',
    Load = 'load',
    Navigate = 'navigate',
    Scroll = 'scroll',
}

export enum TagName {
    A = 'A',
    B = 'B',
    Cite = 'CITE',
    EM = 'EM',
    Input = 'INPUT',
    Select = 'SELECT',
    Span = 'SPAN',
    Strong = 'STRONG',
    TextArea = 'TEXTAREA',
}

export interface BaseAction {
    type: ActionType;
    associatedActions: ActionType[];
    tagName: TagName;
    inputType: string | undefined;
    value: string | undefined;
    selectors: { [key: string]: string | null };
    timestamp: number;
    isPassword: boolean;
    hasOnlyText: boolean; // If the element only has text content inside (hint to use text selector)
}

interface KeydownAction extends BaseAction {
    type: ActionType.Keydown;
    key: string;
}

interface InputAction extends BaseAction {
    type: ActionType.Input;
}

interface ClickAction extends BaseAction {
    type: ActionType.Click;
}

interface DragAndDropAction extends BaseAction {
    type: ActionType.DragAndDrop;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}

interface HoverAction extends BaseAction {
    type: ActionType.Hover;
}

interface LoadAction extends BaseAction {
    type: ActionType.Load;
    url: string;
}

interface NavigateAction extends BaseAction {
    type: ActionType.Navigate;
    url: string;
    source: string;
}

interface WheelAction extends BaseAction {
    type: ActionType.Scroll;
    deltaX: number;
    deltaY: number;
    pageXOffset: number;
    pageYOffset: number;
}

interface FullScreenshotAction extends BaseAction {
    type: ActionType.Screenshot;
}

interface AwaitTextAction extends BaseAction {
    type: ActionType.AwaitText;
    text: string;
}

export type Action =
  | KeydownAction
  | InputAction
  | ClickAction
  | DragAndDropAction
  | HoverAction
  | LoadAction
  | NavigateAction
  | WheelAction
  | FullScreenshotAction
  | AwaitTextAction;
