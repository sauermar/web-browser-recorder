import { Coordinates } from "../interfaces/Input";
import { WorkflowFile } from '@wbr-project/wbr-interpret';
import { WhereWhatPair } from "@wbr-project/wbr-interpret/build/workflow";
import logger from "../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";
import { getFullPath } from "./selector";

export class WorkflowGenerator {

  private readonly socket : Socket;

  private readonly page: Page;

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

  };

  public onClick = async (coordinates: Coordinates) => {
    const selector = await getFullPath(this.page, coordinates);
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

  public onChangeUrl = (newUrl: string) => {
    const pair: WhereWhatPair = {
      where: { url: this.page.url() },
      what: [{
        action: 'goto',
        args: [newUrl],
      }],
    }
    if (this.page.url() === "about:blank") {
      delete pair.where.url;
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public onKeyboardInput = async (key: string, coordinates: Coordinates) => {
    const selector = await getFullPath(this.page, coordinates);
    const pair: WhereWhatPair = {
      where: { url: this.page.url() },
      what: [{
        action: 'press',
        args: [selector, key],
      }],
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public getWorkflowFile = () => {
    return this.workflowRecord;
  };
}
