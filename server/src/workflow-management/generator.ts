import { Coordinates } from "../interfaces/Input";
import { WorkflowFile } from '@wbr-project/wbr-interpret';
import { WhereWhatPair } from "@wbr-project/wbr-interpret/build/workflow";
import logger from "../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";
import { fullPath } from "./selector";

export class WorkflowGenerator {

  private readonly socket : Socket;

  private page: Page;

  public constructor(page: Page, socket: Socket) {
    this.page = page;
    this.socket = socket;
  }

  private workflowRecord: WorkflowFile = {
    workflow: [],
  };

  private addPairToWorkflowAndNotifyClient = (pair: WhereWhatPair) => {
    this.workflowRecord.workflow.push(pair);
    logger.log('debug', `${pair}: Added to workflow file.`);
    this.socket.emit('workflow', this.workflowRecord);
    logger.log('debug',`Workflow emitted`);

  } ;

  public onClick = async (coordinates: Coordinates) => {
    const selector = await this.page.evaluate(
      ({ x,y, /*fullPath*/ }) => {
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
      { x: coordinates.x, y: coordinates.y, /*fullPath*/ },
    );

    logger.log('debug', `Element's selector: ${selector}`);
    const pair: WhereWhatPair = {
      where: { url: this.page.url() },
      what: [{
        action: 'click',
        args: [selector],
      }],
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public onChangeUrl = () => {
    let previousUrl = undefined;
    const lastPair = this.workflowRecord.workflow[this.workflowRecord.workflow.length - 1];
    if (lastPair) {
      previousUrl = lastPair.where.url;
      for (const what of lastPair.what) {
        if (what.action === 'goto') {
          previousUrl = what.args ? what.args[0] : previousUrl;
        }
      }
    }
    const pair: WhereWhatPair = {
      where: {},
      what: [{
        action: 'goto',
        args: [this.page.url()],
      }],
    }
    if (previousUrl) {
      pair.where.url = previousUrl;
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public getWorkflowFile = () => {
    return this.workflowRecord;
  };
}
