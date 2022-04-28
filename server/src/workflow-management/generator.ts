import { Coordinates } from "../interfaces/Input";
import { WorkflowFile } from '@wbr-project/wbr-interpret';
import { WhereWhatPair } from "@wbr-project/wbr-interpret";
import logger from "../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";
import { getFullPath, selectorAlreadyInWorkflow } from "./selector";

export class WorkflowGenerator {

  private socket : Socket;

  private readonly page: Page;

  public constructor(page: Page, socket: Socket) {
    this.page = page;
    this.socket = socket;
  }

  private workflowRecord: WorkflowFile = {
    workflow: [],
  };

  private addPairToWorkflowAndNotifyClient = (pair: WhereWhatPair) => {
    let matched = false;
    if (pair.what[0].args && pair.what[0].args.length > 0) {
      const match = selectorAlreadyInWorkflow(pair.what[0].args[0], this.workflowRecord.workflow);
      if (match) {
        const index = this.workflowRecord.workflow.indexOf(match);
        this.workflowRecord.workflow[index].what = this.workflowRecord.workflow[index].what.concat(pair.what);
        logger.log('info', `Pushed ${JSON.stringify(this.workflowRecord.workflow[index])} to workflow pair`);
        matched = true;
      }
    }
    if (!matched) {
      // we want to have the most specific selectors at the beginning of the workflow
      this.workflowRecord.workflow.unshift(pair);
    }
    logger.log('info', `${JSON.stringify(pair)}: Added to workflow file.`);
    this.socket.emit('workflow', this.workflowRecord);
    logger.log('info',`Workflow emitted`);

  };

  public onClick = async (coordinates: Coordinates) => {
    const selector = await getFullPath(this.page, coordinates);
    logger.log('debug', `Element's selector: ${selector}`);
    const pair: WhereWhatPair = {
      where: { url: this.page.url(), selectors:[selector] },
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
      what: [
        {
        action: 'goto',
        args: [newUrl],
        },
        {
          action: 'waitForNavigation',
          args: [1000],
        }
      ],
    }
    if (this.page.url() === "about:blank") {
      delete pair.where.url;
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public onKeyboardInput = async (key: string, coordinates: Coordinates) => {
    const selector = await getFullPath(this.page, coordinates);
    const pair: WhereWhatPair = {
      where: { url: this.page.url(), selectors: [selector] },
      what: [{
        action: 'press',
        args: [selector, key],
      }],
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public onScroll = () => {
    const pair: WhereWhatPair = {
      where: { url: this.page.url() },
      what: [{
        action: 'scroll',
        args: [],
      }],
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public getWorkflowFile = () => {
    return this.workflowRecord;
  };

  public removePairFromWorkflow = (index: number) => {
    if (index < this.workflowRecord.workflow.length) {
      this.workflowRecord.workflow.splice(index, 1);
      logger.log('debug', `pair ${index}: Removed from workflow file.`);
    }
  };

  public addPairToWorkflow = (index: number, pair: WhereWhatPair) => {
    if (index + 1 < this.workflowRecord.workflow.length) {
      this.workflowRecord.workflow.splice(index + 1, 0, pair);
      logger.log('debug', `pair ${index}: Added to workflow file.`);
    } else if (index + 1 === this.workflowRecord.workflow.length) {
      this.workflowRecord.workflow.push(pair);
      logger.log('debug', `pair ${index}: Added to workflow file.`);
    }
  };

  public updateSocket = (socket: Socket) : void => {
    this.socket = socket;
  };
}
