import Interpreter, { WorkflowFile } from "@wbr-project/wbr-interpret";
import fs from "fs";
import { Page } from "playwright";

export const interpretWorkflow = async (workflow: WorkflowFile, page: Page) => {
  const options = {
    serializableCallback: console.log,
    binaryCallback: (data: string) => fs.writeFileSync("output", data)
  }

  const interpreter = new Interpreter(workflow, options);

  await interpreter.run(
    page
  );
};
