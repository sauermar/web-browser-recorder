import { Action, ActionType, Coordinates, TagName } from "../../types";
import { WhereWhatPair, WorkflowFile } from '@wbr-project/wbr-interpret';
import logger from "../../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";
import { getElementInformation, getFullPath, getRect, getSelectors, selectorAlreadyInWorkflow } from "../selector";
import { ScreenshotSettings, ScrollSettings } from "../../../../src/shared/types";
import { workflow } from "../../routes";
import { saveFile } from "../storage";
import fs from "fs";
import { getBestSelectorForAction } from "../utils";

interface PersistedGeneratedData {
  lastUsedSelector: string;
  lastActiveUrl: string;
}

export class WorkflowGenerator {

  private socket : Socket;

  public constructor(socket: Socket) {
    this.socket = socket;
    socket.on('save', (fileName: string) => this.saveNewWorkflow(fileName));
    socket.on('new-recording', () => this.workflowRecord = {
      workflow: [],
    } );
  }

  private workflowRecord: WorkflowFile = {
    workflow: [],
  };

  // we need to persist some data between actions for correct generating of the workflow
  private generatedData: PersistedGeneratedData = {
    lastUsedSelector: '',
    // the first url is the default one
    lastActiveUrl: 'about:blank',
  }

  private addPairToWorkflowAndNotifyClient = (pair: WhereWhatPair) => {
    let matched = false;
    if (pair.what[0].args && pair.what[0].args.length > 0) {
      this.generatedData.lastUsedSelector = pair.what[0].args[0];
      const match = selectorAlreadyInWorkflow(pair.what[0].args[0], this.workflowRecord.workflow);
      if (match) {
        const index = this.workflowRecord.workflow.indexOf(match);
        this.workflowRecord.workflow[index].what = this.workflowRecord.workflow[index].what.concat(pair.what);
        logger.log('info', `Pushed ${JSON.stringify(this.workflowRecord.workflow[index])} to workflow pair`);
        matched = true;
      }
    }
    if (!matched) {
      // adding flag as a top action to every pair for pausing/resuming
      pair.what.unshift({
        action: 'flag',
        args: ['generated'],
      })
      //adding waitForLoadState with networkidle, for better success rate of automatically recorded workflows
      pair.what.push({
        action: 'waitForLoadState',
        args: ['networkidle'],
      })
      // we want to have the most specific selectors at the beginning of the workflow
      this.workflowRecord.workflow.unshift(pair);
    }
    logger.log('info', `${JSON.stringify(pair)}: Added to workflow file.`);
    this.socket.emit('workflow', this.workflowRecord);
    logger.log('info',`Workflow emitted`);

  };

  public onClick = async (coordinates: Coordinates, page: Page) => {
    let where: WhereWhatPair["where"] = { url: page.url() };
    const selector = await this.generateSelector(page, coordinates, ActionType.Click);
    logger.log('debug', `Element's selector: ${selector}`);
    //const element = await getElementMouseIsOver(page, coordinates);
    //logger.log('debug', `Element: ${JSON.stringify(element, null, 2)}`);
    if (selector) {
      where.selectors = [selector];
    }
    const pair: WhereWhatPair = {
      where,
      what: [{
        action: 'click',
        args: [selector],
      }],
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public onChangeUrl = (newUrl: string, page: Page) => {
    this.generatedData.lastUsedSelector = '';
    const pair: WhereWhatPair = {
      where: { url: this.generatedData.lastActiveUrl },
      what: [
        {
        action: 'goto',
        args: [newUrl],
        }
      ],
    }
    this.generatedData.lastActiveUrl = newUrl;
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public onKeyboardInput = async (key: string, coordinates: Coordinates, page: Page) => {
    let where: WhereWhatPair["where"] = { url: page.url() };
    const selector = await this.generateSelector(page, coordinates, ActionType.Keydown);
    if (selector) {
      where.selectors = [selector];
    }
    const pair: WhereWhatPair = {
      where,
      what: [{
        action: 'press',
        args: [selector, key],
      }],
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public scroll = ({ scrollPages }: ScrollSettings, page: Page) => {
    const pair: WhereWhatPair = {
      where: { url: page.url()},
      what: [{
        action: 'scroll',
        args: [scrollPages],
      }],
    }
    // For scroll get the previous selector used to define a better where clause
    if (this.generatedData.lastUsedSelector) {
      pair.where.selectors = [this.generatedData.lastUsedSelector];
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public screenshot = (settings: ScreenshotSettings, page: Page) => {
    const pair: WhereWhatPair = {
      where: { url: page.url() },
      what: [{
        action: 'screenshot',
        args: [settings],
      }],
    }
    // For screenshot get the previous selector used to define a better where clause
    if (this.generatedData.lastUsedSelector) {
      pair.where.selectors = [this.generatedData.lastUsedSelector];
    }
    this.addPairToWorkflowAndNotifyClient(pair);
  };

  public getWorkflowFile = () => {
    return this.workflowRecord;
  };

  public removePairFromWorkflow = (index: number) => {
    if (index <= this.workflowRecord.workflow.length && index >= 0) {
      this.workflowRecord.workflow.splice(this.workflowRecord.workflow.length - (index + 1), 1);
      logger.log('debug', `pair ${index}: Removed from workflow file.`);
    } else {
      logger.log('error', `Delete pair ${index}: Index out of range.`);
    }
  };

  public addPairToWorkflow = (index: number, pair: WhereWhatPair) => {
    if (index === this.workflowRecord.workflow.length) {
      this.workflowRecord.workflow.unshift(pair);
      logger.log('debug', `pair ${index}: Added to workflow file.`);
    } else if (index < this.workflowRecord.workflow.length && index >= 0) {
      this.workflowRecord.workflow.splice(
        this.workflowRecord.workflow.length - index , 0, pair);
    } else {
      logger.log('error', `Add pair ${index}: Index out of range.`);
    }
  };

  public updatePairInWorkflow = (index: number, pair: WhereWhatPair) => {
    if (index <= this.workflowRecord.workflow.length && index >= 0) {
      this.workflowRecord.workflow[this.workflowRecord.workflow.length - (index + 1)] = pair;
    } else {
      logger.log('error', `Update pair ${index}: Index out of range.`);
    }
  };

  public updateSocket = (socket: Socket) : void => {
    this.socket = socket;
  };

  private removeAllGeneratedFlags = (workflow: WorkflowFile): WorkflowFile => {
      for (let i = 0; i < workflow.workflow.length; i++) {
        if (workflow.workflow[i].what[0].action === 'flag' &&
          workflow.workflow[i].what[0].args?.includes('generated')) {
          workflow.workflow[i].what.splice(0, 1);
        }
      }
      return workflow;
  };

  private AddGeneratedFlags = (workflow: WorkflowFile): WorkflowFile => {
    for (let i = 0; i < workflow.workflow.length; i++) {
      workflow.workflow[i].what.unshift({
        action: 'flag',
        args: ['generated'],
      });
    }
    return workflow;
  };

  public updateWorkflowFile = (workflowFile: WorkflowFile) => {
    const stoppableWorkflow = this.AddGeneratedFlags(workflowFile);
    this.workflowRecord = stoppableWorkflow;
  }

  public saveNewWorkflow = async (fileName: string) => {
    try {
      const recording = this.removeAllGeneratedFlags(this.workflowRecord);
      const recording_meta = {
        name: fileName,
        create_date: new Date().toLocaleString(),
        pairs: recording.workflow.length,
        update_date: new Date().toLocaleString(),
      };
      fs.mkdirSync('../recordings', { recursive: true })
      await saveFile(
        `../recordings/${fileName}.waw.json`,
        JSON.stringify({ recording_meta, recording }, null, 2)
      );
    } catch (e) {
      const { message } = e as Error;
      logger.log('warn', `Cannot save the file to the local file system`)
      console.log(message);
    }
  }

  private generateSelector = async (page:Page, coordinates:Coordinates, action: ActionType) => {
    const elementInfo = await getElementInformation(page, coordinates);
    const bestSelector = getBestSelectorForAction(
      {
        type: action,
        tagName: elementInfo?.tagName as TagName || '',
        inputType: undefined,
        value: undefined,
        selectors: await getSelectors(page, coordinates) || {},
        timestamp: 0,
        isPassword: false,
        hasOnlyText: elementInfo?.hasOnlyText || false,
      } as Action,
    );
    return bestSelector;
  }

  public generateDataForHighlighter = async (page: Page, coordinates: Coordinates) => {
    const rect = await getRect(page, coordinates);
    const displaySelector = await this.generateSelector(page, coordinates, ActionType.Click);
    if (rect) {
      this.socket.emit('highlighter', { rect, selector: displaySelector });
    }
  }

  public notifyUrlChange = (url:string, fromNavBar:boolean) => {
    if (this.socket) {
      if (fromNavBar) {
        this.socket.emit('currentUrl', url);
      } else {
        this.socket.emit('urlAfterClick', url);
        this.generatedData.lastActiveUrl = url;
      }
    }
  }
}
