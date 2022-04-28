import { Page } from "playwright";
import { Coordinates } from "../interfaces/Input";
import { WhereWhatPair, WorkflowFile } from "@wbr-project/wbr-interpret";
import logger from "../logger";

type Workflow = WorkflowFile["workflow"];

export const getFullPath = async (page: Page, coordinates: Coordinates) => {
  return await page.evaluate(
    ({ x,y }) => {
      const fullPath = (el: any): string => {
        let names = [];
        while (el.parentNode){
          if (el.id){
            names.unshift('#'+el.id);
            break;
          } else {
            if (el==el.ownerDocument.documentElement) {
              names.unshift(el.tagName);
            } else {
              for (var c=1,e=el;e.previousElementSibling;e=e.previousElementSibling,c++);
              names.unshift(el.tagName+":nth-child("+c+")");
            }
            el = el.parentNode;
          }
        }
        return names.join(" > ");
      }

      const element = document.elementFromPoint(x, y);
      const selector = fullPath(element);
      return selector || '';
    },
    { x: coordinates.x, y: coordinates.y },
  );
};

export const selectorAlreadyInWorkflow = (selector: string, workflow: Workflow) => {
  return workflow.find((pair: WhereWhatPair) => {
    if (pair.where.selectors?.includes(selector)) {
      if (pair.where.selectors?.length === 1) {
        return pair;
      }
    }
  });
}

