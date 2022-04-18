import { Coordinates } from "../interfaces/Input";
import { WorkflowFile } from '@wbr-project/wbr-interpret';
import { WhereWhatPair } from "@wbr-project/wbr-interpret/build/workflow";
import logger from "../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";

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

  public onClick = (coordinates: Coordinates) => {
    const pair: WhereWhatPair = {
      where: { url: this.page.url() },
      what: [{
        action: 'click',
        args: [
          {
            position: coordinates,
          }
        ],
      }],
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public onChangeUrl = () => {
    const previousUrl = this.workflowRecord.workflow[this.workflowRecord.workflow.length - 1]?.where.url;
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
