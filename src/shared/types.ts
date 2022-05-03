import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { Locator } from "playwright";

export type Workflow = WorkflowFile["workflow"];

export interface ScrollSettings {
  scrollPages: number;
};

export interface ScreenshotSettings {
  animations?: "disabled" | "allow";
  caret?: "hide" | "initial";
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fullPage?: boolean;
  mask?: Locator[];
  omitBackground?: boolean;
  // is this still needed? - @wbr-project/wbr-interpret outputs to a binary output
  path?: string;
  quality?: number;
  scale?: "css" | "device";
  timeout?: number;
  type?: "jpeg" | "png";
};
