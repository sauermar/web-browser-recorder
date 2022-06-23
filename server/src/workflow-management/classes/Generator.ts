import { Action, ActionType, Coordinates, TagName } from "../../types";
import { WhereWhatPair, WorkflowFile } from '@wbr-project/wbr-interpret';
import logger from "../../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";
import {
  getElementInformation,
  getRect,
  getSelectors,
  isRuleOvershadowing,
  selectorAlreadyInWorkflow
} from "../selector";
import { ScreenshotSettings, ScrollSettings } from "../../../../src/shared/types";
import { workflow } from "../../routes";
import { saveFile } from "../storage";
import fs from "fs";
import { getBestSelectorForAction } from "../utils";

interface PersistedGeneratedData {
  lastUsedSelector: string;
  lastIndex: number|null;
}

export class WorkflowGenerator {

  private socket : Socket;

  public constructor(socket: Socket) {
    this.socket = socket;
    socket.on('save', (fileName: string) => this.saveNewWorkflow(fileName));
    socket.on('new-recording', () => this.workflowRecord = {
      workflow: [],
    } );
    socket.on('activeIndex', (data) => this.generatedData.lastIndex = parseInt(data));
  }

  private workflowRecord: WorkflowFile = {
    workflow: [],
  };

  // we need to persist some data between actions for correct generating of the workflow
  private generatedData: PersistedGeneratedData = {
    lastUsedSelector: '',
    lastIndex: null,
  }

  private addPairToWorkflowAndNotifyClient = async(pair: WhereWhatPair, page: Page) => {
    let matched = false;
    // validate if a pair with the same where conditions is already present in the workflow
    if (pair.what[0].args && pair.what[0].args.length > 0) {
      //TODO not sure about validity
      this.generatedData.lastUsedSelector = pair.what[0].args[0];
      const match = selectorAlreadyInWorkflow(pair.what[0].args[0], this.workflowRecord.workflow);
      if (match) {
        // if a match of where conditions is found, the new action is added into the matched rule
        const matchedIndex = this.workflowRecord.workflow.indexOf(match);
        pair.what.push({
          action: 'waitForLoadState',
          args: ['networkidle'],
        })
        this.workflowRecord.workflow[matchedIndex].what = this.workflowRecord.workflow[matchedIndex].what.concat(pair.what);
        logger.log('info', `Pushed ${JSON.stringify(this.workflowRecord.workflow[matchedIndex])} to workflow pair`);
        matched = true;
      }
    }
    // is the where conditions of the pair are not already in the workflow, we need to validate the where conditions
    // for possible overshadowing of different rules and handle cases according to the recording logic
    if (!matched) {
      const handled = await this.handleOverShadowing(pair, page, this.generatedData.lastIndex || 0);
      if (!handled) {
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
        if (this.generatedData.lastIndex === 0) {
          this.generatedData.lastIndex = null;
          // we want to have the most specific selectors at the beginning of the workflow
          this.workflowRecord.workflow.unshift(pair);
        } else {
          this.workflowRecord.workflow.splice(this.generatedData.lastIndex || 0, 0, pair);
          if (this.generatedData.lastIndex) {
            this.generatedData.lastIndex = this.generatedData.lastIndex - 1;
          }
        }
        logger.log('info',
          `${JSON.stringify(pair)}: Added to workflow file on index: ${this.generatedData.lastIndex || 0}`);
      } else {
        logger.log('debug',
          ` ${JSON.stringify(this.workflowRecord.workflow[this.generatedData.lastIndex || 0])} added action to workflow pair`);
      }
    }
    this.socket.emit('workflow', this.workflowRecord);
    logger.log('info',`Workflow emitted`);
  };

  public onClick = async (coordinates: Coordinates, page: Page) => {
    let where: WhereWhatPair["where"] = { url: this.getBestUrl(page.url()) };
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
    await this.addPairToWorkflowAndNotifyClient(pair, page);
  };

  public onChangeUrl = async(newUrl: string, page: Page) => {
    this.generatedData.lastUsedSelector = '';
    const pair: WhereWhatPair = {
      where: { url: this.getBestUrl(page.url()) },
      what: [
        {
        action: 'goto',
        args: [newUrl],
        }
      ],
    }
    await this.addPairToWorkflowAndNotifyClient(pair, page);
  };

  public onKeyboardInput = async (key: string, coordinates: Coordinates, page: Page) => {
    let where: WhereWhatPair["where"] = { url: this.getBestUrl(page.url()) };
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
    await this.addPairToWorkflowAndNotifyClient(pair, page);
  };

  public scroll = async ({ scrollPages }: ScrollSettings, page: Page) => {
    const pair: WhereWhatPair = {
      where: { url: this.getBestUrl(page.url())},
      what: [{
        action: 'scroll',
        args: [scrollPages],
      }],
    }
    // For scroll get the previous selector used to define a better where clause
    if (this.generatedData.lastUsedSelector) {
      pair.where.selectors = [this.generatedData.lastUsedSelector];
    }
    await this.addPairToWorkflowAndNotifyClient(pair, page);
  };

  public screenshot = async (settings: ScreenshotSettings, page: Page) => {
    const pair: WhereWhatPair = {
      where: { url: this.getBestUrl(page.url()) },
      what: [{
        action: 'screenshot',
        args: [settings],
      }],
    }
    // For screenshot get the previous selector used to define a better where clause
    if (this.generatedData.lastUsedSelector) {
      pair.where.selectors = [this.generatedData.lastUsedSelector];
    }
    await this.addPairToWorkflowAndNotifyClient(pair, page);
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
      fs.mkdirSync('../storage/recordings', { recursive: true })
      await saveFile(
        `../storage/recordings/${fileName}.waw.json`,
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

  public notifyUrlChange = (url:string) => {
    if (this.socket) {
      this.socket.emit('urlChanged', url);
    }
  }

  public notifyOnNewTab = (url: string) => {
    if (this.socket){
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname?.match(/\b(?!www\.)[a-zA-Z0-9]+/g)?.join('.');
      this.socket.emit('newTab', host ? host : 'new tab')
      console.log('notified about a new tab')
    }
  }

  public onGoBack = (newUrl: string) => {
    //it's safe to always add a go back action to the first rule in the workflow
    this.workflowRecord.workflow[0].what.push({
      action: 'goBack',
      args: [{waitUntil: 'commit'}],
    });
    this.notifyUrlChange(newUrl);
    this.socket.emit('workflow', this.workflowRecord);
  }

  public onGoForward = (newUrl: string) => {
    //it's safe to always add a go forward action to the first rule in the workflow
    this.workflowRecord.workflow[0].what.push({
      action: 'goForward',
      args: [{waitUntil: 'commit'}],
    });
    this.notifyUrlChange(newUrl);
    this.socket.emit('workflow', this.workflowRecord);
  }

  private IsOverShadowingAction = async (pair: WhereWhatPair, page: Page) => {
    type possibleOverShadow = {
      index: number;
      isOverShadowing: boolean;
    }

    const possibleOverShadow: possibleOverShadow[] = [];
    const haveSameUrl = this.workflowRecord.workflow
      .filter((p, index) => {
        if (p.where.url === pair.where.url) {
          possibleOverShadow.push({index: index, isOverShadowing: false});
          return true;
        } else {
          return false;
        }
      });

    if (haveSameUrl.length !== 0) {
      for (let i = 0; i < haveSameUrl.length; i++) {
        //@ts-ignore
        if (haveSameUrl[i].where.selectors && haveSameUrl[i].where.selectors.length > 0) {
          //@ts-ignore
          const isOverShadowing = await isRuleOvershadowing(haveSameUrl[i].where.selectors, page);
          if (isOverShadowing) {
            possibleOverShadow[i].isOverShadowing = true;
          }
        }
      }
    }
    return possibleOverShadow;
  }


  private handleOverShadowing = async (pair: WhereWhatPair, page: Page, index: number): Promise<boolean> => {
    const overShadowing = (await this.IsOverShadowingAction(pair, page))
      .filter((p) => p.isOverShadowing);
    if (overShadowing.length !== 0) {
      for (const overShadowedAction of overShadowing) {
        if (overShadowedAction.index === index) {
          // add new selector to the where part of the overshadowing pair
          this.workflowRecord.workflow[index].where.selectors =
            this.workflowRecord.workflow[index].where.selectors?.concat(pair.where.selectors || []);
          // push the action automatically to the first/the closest rule which would be overShadowed
          this.workflowRecord.workflow[index].what =
            this.workflowRecord.workflow[index].what.concat(pair.what);
          return true;
        } else {
          // notify client about overshadowing a further rule
          return false;
        }
      }
    }
    return false;
  }

  private getBestUrl = (url: string) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:' ? `${parsedUrl.protocol}//`: parsedUrl.protocol;
    if (parsedUrl.search) {
      //TODO: let the user choose which query parameteres wants to include in search part of the regex
      const searchQuery = parsedUrl.search.split('&');
      return { $regex: `^${protocol}${parsedUrl.host}${parsedUrl.pathname}.*$`}
    }
    return `${protocol}${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.hash}`;
  }

  public clearLastIndex = () => {
    this.generatedData.lastIndex = null;
  }
}
