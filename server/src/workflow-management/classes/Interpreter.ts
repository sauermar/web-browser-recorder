import Interpreter, { WorkflowFile } from "@wbr-project/wbr-interpret";
import logger from "../../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";
import { InterpreterSettings } from "../../types";
import { saveFile } from "../storage";


export class WorkflowInterpreter {

  private socket : Socket;

  public interpretationIsPaused: boolean = false;

  private interpreter: Interpreter | null = null;

  private activeId: number | null = null;

  public debugMessages: string[] = [];

  public serializableData: string[] = [];

  public binaryData: {mimetype: string, data: string}[] = [];

  private breakpoints: boolean[] = [];

  private interpretationResume: (() => void) | null = null;

  constructor (socket: Socket) {
    this.socket = socket;
  }

  public subscribeToPausing = () => {
    this.socket.on('pause', () => {
      this.interpretationIsPaused = true;
    });
    this.socket.on('resume', () => {
      this.interpretationIsPaused = false;
      if (this.interpretationResume) {
        this.interpretationResume();
      } else {
        logger.log('debug',"Resume called but no resume function is set");
      }
    });
    this.socket.on('step', () => {
      if (this.interpretationResume) {
        this.interpretationResume();
      } else {
        logger.log('debug', "Step called but no resume function is set");
      }
    });
    this.socket.on('breakpoints', (data: boolean[]) => this.breakpoints = data);
  }

  public interpretRecordingInEditor = async (
    workflow: WorkflowFile,
    page: Page,
    updatePageOnPause: (page: Page) => void,
  ) => {
    const options = {
      maxConcurrency: 1,
      maxRepeats: 1,
      debugChannel: {
        activeId: (id: any) => {
          this.activeId = id;
          this.socket.emit('activePairId', id);
        },
        debugMessage: (msg: any) => {
          this.debugMessages.push(`[${new Date().toLocaleString()}] ` + msg);
          this.socket.emit('log', msg)
        },
      },
      serializableCallback: (data: any) => {
        console.log(data);
        this.socket.emit('serializableCallback', data);
      },
      binaryCallback: (data: string, mimetype: string) => {
        console.log(data);
        this.socket.emit('binaryCallback', {data, mimetype});
      }
    }

    const interpreter = new Interpreter(workflow, options);
    this.interpreter = interpreter;

    interpreter.on('flag', async (page, resume) => {
      if (this.activeId && this.breakpoints[this.activeId]) {
        logger.log('debug',`breakpoint hit id: ${this.activeId}`);
        this.socket.emit('breakpointHit');
        this.interpretationIsPaused = true;
      }

      if (this.interpretationIsPaused) {
        this.interpretationResume = resume;
        logger.log('debug',`Paused inside of flag: ${page.url()}`);
        updatePageOnPause(page);
      } else {
        resume();
      }
    });

    await interpreter.run(page);

    logger.log('debug',`Interpretation finished`);
    this.interpreter = null;
    this.socket.emit('activePairId', -1);
    this.interpretationIsPaused = false;
    this.interpretationResume = null;
    this.socket.emit('finished');
  };

  public stopInterpretation = async () => {
    if (this.interpreter) {
      logger.log('info', 'Stopping the interpretation.');
      await this.interpreter.stop();
      this.clearState();
    } else {
      logger.log('error', 'Cannot stop: No active interpretation.');
    }
  };

  private clearState = () => {
    this.debugMessages = [];
    this.interpretationIsPaused = false;
    this.activeId = null;
    this.interpreter = null;
    this.breakpoints = [];
    this.interpretationResume = null;
    this.serializableData = [];
    this.binaryData = [];
  }

  public InterpretRecording = async (workflow: WorkflowFile, page: Page, settings: InterpreterSettings) => {
    const params = settings.params ? settings.params : null;
    delete settings.params;
    const options = {
      ...settings,
      debugChannel: {
        activeId: (id: any) => {
          this.activeId = id;
          this.socket.emit('activePairId', id);
        },
        debugMessage: (msg: any) => {
          this.debugMessages.push(`[${new Date().toLocaleString()}] ` + msg);
          this.socket.emit('debugMessage', msg)
        },
      },
      serializableCallback: (data: string) => {
        this.serializableData.push(data);
        this.socket.emit('serializableCallback', data);
      },
      binaryCallback: async (data: string, mimetype: string) => {
        this.binaryData.push({mimetype, data: JSON.stringify(data)});
        this.socket.emit('binaryCallback', {data, mimetype});
      }
    }

    const interpreter = new Interpreter(workflow, options);
    this.interpreter = interpreter;

    const status = await interpreter.run(page, params);

    const result = {
      log: this.debugMessages,
      result: status,
      serializableOutput: this.serializableData.reduce((reducedObject, item, index) => {
        return {
          [`item-${index}`]: item,
          ...reducedObject,
        }
      }, {}),
      binaryOutput: this.binaryData.reduce((reducedObject, item, index) => {
        return {
          [`item-${index}`]: item,
          ...reducedObject,
        }
      }, {})
    }

    logger.log('debug',`Interpretation finished`);
    this.clearState();
    return result;
  }

  public interpretationInProgress = () => {
    return this.interpreter !== null;
  };

  public updateSocket = (socket: Socket) : void => {
    this.socket = socket;
    this.subscribeToPausing();
  };
}
