import Interpreter, { WorkflowFile } from "@wbr-project/wbr-interpret";
import fs from "fs";
import { Page } from "playwright";
import { RemoteBrowser } from "../browser-management/classes/RemoteBrowser";

export const interpretWorkflow = async (workflow: WorkflowFile, browser: RemoteBrowser) => {
  const options = {
    serializableCallback: console.log,
    binaryCallback: (data: string, mimetype: string) => fs.writeFileSync("output", data)
  }

  const interpreter = new Interpreter(workflow, options);
  browser.interpreter = interpreter;

  if (browser.currentPage) {
    await interpreter.run(
      browser.currentPage
    );
  }
};

export const stopInterpretation = async (interpreter: Interpreter) => {
    await interpreter.stop();
};
