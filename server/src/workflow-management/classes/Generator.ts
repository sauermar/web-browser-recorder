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
import { CustomActions } from "../../../../src/shared/types";
import { workflow } from "../../routes";
import { saveFile } from "../storage";
import fs from "fs";
import { getBestSelectorForAction } from "../utils";
import { browserPool } from "../../server";

interface PersistedGeneratedData {
  lastUsedSelector: string;
  lastIndex: number|null;
  lastAction: string;
}

interface MetaData {
  name: string;
  create_date: string;
  pairs: number;
  update_date: string;
  params: string[],
}

export class WorkflowGenerator {

  private socket : Socket;

  public constructor(socket: Socket) {
    this.socket = socket;
    this.registerEventHandlers(socket);
  }

  private workflowRecord: WorkflowFile = {
    workflow: [],
  };

  private recordingMeta: MetaData = {
    name: '',
    create_date: '',
    pairs: 0,
    update_date: '',
    params: [],
  }

  // we need to persist some data between actions for correct generating of the workflow
  private generatedData: PersistedGeneratedData = {
    lastUsedSelector: '',
    lastIndex: null,
    lastAction: '',
  }

  private registerEventHandlers = (socket: Socket) => {
    socket.on('save', async (fileName: string) => {
      logger.log('debug', `Saving workflow ${fileName}`);
      await this.saveNewWorkflow(fileName)
    });
    socket.on('new-recording', () => this.workflowRecord = {
      workflow: [],
    } );
    socket.on('activeIndex', (data) => this.generatedData.lastIndex = parseInt(data));
    socket.on('decision', async ({pair, actionType, decision}) => {
      const id = browserPool.getActiveBrowserId();
      if (id) {
        const activeBrowser = browserPool.getRemoteBrowser(id);
        const currentPage = activeBrowser?.getCurrentPage();
        if (decision) {
          switch (actionType) {
            case 'customAction':
              pair.where.selectors = [this.generatedData.lastUsedSelector];
              break;
            default: break;
          }
        }
        if (currentPage) {
          await this.addPairToWorkflowAndNotifyClient(pair, currentPage);
        }
      }
    })
    socket.on('updatePair', (data) => {
      this.updatePairInWorkflow(data.index, data.pair);
    })
  };

  private addPairToWorkflowAndNotifyClient = async(pair: WhereWhatPair, page: Page) => {
    let matched = false;
    // validate if a pair with the same where conditions is already present in the workflow
    if (pair.where.selectors && pair.where.selectors[0]) {
      const match = selectorAlreadyInWorkflow(pair.where.selectors[0], this.workflowRecord.workflow);
      console.log(match, 'Does the new pair have previously recorded selectors?')
      if (match) {
        // if a match of where conditions is found, the new action is added into the matched rule
        const matchedIndex = this.workflowRecord.workflow.indexOf(match);
        if (pair.what[0].action !== 'waitForLoadState' && pair.what[0].action !== 'press') {
          pair.what.push({
            action: 'waitForLoadState',
            args: ['networkidle'],
          })
        }
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
        //adding waitForLoadState with networkidle, for better success rate of automatically recorded workflows
        if (pair.what[0].action !== 'waitForLoadState' && pair.what[0].action !== 'press') {
          pair.what.push({
            action: 'waitForLoadState',
            args: ['networkidle'],
          })
        }
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
    if (selector) {
      this.generatedData.lastUsedSelector = selector;
      this.generatedData.lastAction = 'click';
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
    if (selector) {
      this.generatedData.lastUsedSelector = selector;
      this.generatedData.lastAction = 'press';
    }
    await this.addPairToWorkflowAndNotifyClient(pair, page);
  };

  public customAction = async (action: CustomActions, settings: any, page: Page) => {
    const pair: WhereWhatPair = {
      where: { url: this.getBestUrl(page.url())},
      what: [{
        action,
        args: settings ? Array.isArray(settings) ? settings : [settings] : [],
      }],
    }

    if (this.generatedData.lastUsedSelector) {
      this.socket.emit('decision', {
        pair, actionType: 'customAction',
        lastData: {
          selector: this.generatedData.lastUsedSelector,
          action: this.generatedData.lastAction,
        } });
    } else {
      await this.addPairToWorkflowAndNotifyClient(pair, page);
    }
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
    this.registerEventHandlers(socket);
  };

  private removeAllGeneratedFlags = (workflow: WorkflowFile): WorkflowFile => {
      for (let i = 0; i < workflow.workflow.length; i++) {
        if (
          workflow.workflow[i].what[0] &&
          workflow.workflow[i].what[0].action === 'flag' &&
          workflow.workflow[i].what[0].args?.includes('generated')) {
          workflow.workflow[i].what.splice(0, 1);
        }
      }
      return workflow;
  };

  public AddGeneratedFlags = (workflow: WorkflowFile): WorkflowFile => {
    const copy = JSON.parse(JSON.stringify(workflow));
    for (let i = 0; i < workflow.workflow.length; i++) {
      copy.workflow[i].what.unshift({
        action: 'flag',
        args: ['generated'],
      });
    }
    return copy;
  };

  public updateWorkflowFile = (workflowFile: WorkflowFile, meta: MetaData) => {
    this.recordingMeta = meta;
    const params = this.checkWorkflowForParams(workflowFile);
    if (params) {
      this.recordingMeta.params = params;
    }
    this.workflowRecord = workflowFile;
  }

  public saveNewWorkflow = async (fileName: string) => {
    const recording = this.optimizeWorkflow(this.workflowRecord);
    try {
      this.recordingMeta = {
        name: fileName,
        create_date: this.recordingMeta.create_date || new Date().toLocaleString(),
        pairs: recording.workflow.length,
        update_date: new Date().toLocaleString(),
        params: this.getParams() || [],
      }
      fs.mkdirSync('../storage/recordings', { recursive: true })
      await saveFile(
        `../storage/recordings/${fileName}.waw.json`,
        JSON.stringify({ recording_meta: this.recordingMeta, recording }, null, 2)
      );
    }
     catch (e) {
      const { message } = e as Error;
      logger.log('warn', `Cannot save the file to the local file system`)
      console.log(message);
    }
    this.socket.emit('fileSaved');
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
          if (pair.where.selectors) {
            for (const selector of pair.where.selectors) {
              if (this.workflowRecord.workflow[index].where.selectors?.includes(selector)) {
                break;
              } else {
                // add new selector to the where part of the overshadowing pair
                  this.workflowRecord.workflow[index].where.selectors?.push(selector);
              }
            }
          }
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

  private checkWorkflowForParams = (workflow: WorkflowFile): string[]|null => {
    // for now the where condition cannot have any params, so we're checking only what part of the pair
    // where only the args part of what condition can have a parameter
    for (const pair of workflow.workflow) {
      for (const condition of pair.what) {
        if (condition.args) {
          const params: any[] = [];
          condition.args.forEach((arg) => {
            if (arg.$param) {
              params.push(arg.$param);
            }
          })
          if (params.length !== 0) {
            return params;
          }
        }
      }
    }
    return null;
  }

  private optimizeWorkflow = (workflow: WorkflowFile) => {

    // replace a sequence of press actions by a single fill action
    let input = {
      selector: '',
      value: '',
      actionCounter: 0,
    };

    const pushTheOptimizedAction = (pair: WhereWhatPair, index: number) => {
      if (input.value.length === 1) {
        // when only one press action is present, keep it and add a waitForLoadState action
        pair.what.splice(index + 1, 0, {
          action: 'waitForLoadState',
          args: ['networkidle'],
        })
      } else {
        // when more than one press action is present, add a type action
        pair.what.splice(index - input.actionCounter, input.actionCounter, {
          action: 'type',
          args: [input.selector, input.value], }, {
          action: 'waitForLoadState',
          args: ['networkidle'], });
      }
    }


    for (const pair of workflow.workflow) {
      pair.what.forEach( (condition, index) => {
        if (condition.action === 'press') {
          if (condition.args && condition.args[1]) {
            if (!input.selector) {
              input.selector = condition.args[0];
            }
            if (input.selector === condition.args[0]) {
              input.actionCounter++;
              if (condition.args[1].length === 1) {
                input.value = input.value + condition.args[1];
              } else if (condition.args[1] === 'Backspace') {
                input.value = input.value.slice(0, -1);
              } else if (condition.args[1] !== 'Shift') {
                pushTheOptimizedAction(pair, index);
                pair.what.splice(index + 1, 0, {
                  action: 'waitForLoadState',
                  args: ['networkidle'],
                })
                input = {selector: '', value: '', actionCounter: 0};
              }
            } else {
              pushTheOptimizedAction(pair, index);
              input = {
                selector: condition.args[0],
                value: condition.args[1],
                actionCounter: 1,
              };
            }
          }
        } else {
          if (input.value.length !== 0) {
            pushTheOptimizedAction(pair, index);
            // clear the input
            input = {selector: '', value: '', actionCounter: 0};
          }
        }
      });
    }
    return workflow;
  }

  public getParams = (): string[]|null => {
    return this.checkWorkflowForParams(this.workflowRecord);
  }

  public clearLastIndex = () => {
    this.generatedData.lastIndex = null;
  }
}
