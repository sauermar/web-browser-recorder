import Interpreter, { WorkflowFile } from "@wbr-project/wbr-interpret";
import fs from "fs";
import logger from "../../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";


export class WorkflowInterpreter {

  public interpretationIsPaused: boolean = false;

  private interpreter: Interpreter | null = null;

  private activeId: number | null = null;

  private debugMessages: string[] = [];

  private breakpoints: boolean[] = [];

  private interpretationResume: (() => void) | null = null;

  constructor (socket: Socket) {
    socket.on('pause', () => {
      this.interpretationIsPaused = true;
    });
    socket.on('resume', () => {
      this.interpretationIsPaused = false;
      if (this.interpretationResume) {
        this.interpretationResume();
      } else {
        logger.log('debug',"Resume called but no resume function is set");
      }
    });
    socket.on('step', () => {
      if (this.interpretationResume) {
        this.interpretationResume();
      } else {
        logger.log('debug', "Step called but no resume function is set");
      }
    });
    socket.on('breakpoints', (data: boolean[]) => this.breakpoints = data);
  }

  public interpretRecording = async (
    socket: Socket,
    workflow: WorkflowFile,
    page: Page,
    updatePageOnPause: (page: Page) => void,
  ) => {
    const options = {
      maxConcurrency: 1,
      maxRepeats: 5,
      debugChannel: {
        activeId: (id: any) => {
          this.activeId = id;
          socket.emit('activePairId', id);
        },
        // the receiver is not yet implemented
        debugMessage: (msg: any) => {
          this.debugMessages.push(msg);
          socket.emit('debugMessage', msg)
        },
      },
      serializableCallback: console.log,
      binaryCallback: (data: string, mimetype: string) => fs.writeFileSync("output", data)
    }

    const interpreter = new Interpreter(workflow, options);
    this.interpreter = interpreter;

    interpreter.on('flag', async (page, resume) => {
      if (this.activeId && this.breakpoints[this.activeId]) {
        logger.log('debug',`breakpoint hit id: ${this.activeId}`);
        socket.emit('breakpointHit');
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
    this.interpretationIsPaused = false;
    this.interpretationResume = null;
    socket.emit('finished');
  };

  public stopInterpretation = async () => {
    if (this.interpreter) {
      logger.log('info', 'Stopping the interpretation.');
      await this.interpreter.stop();
      this.interpreter = null;
    } else {
      logger.log('error', 'Cannot stop: No active interpretation.');
    }
  };

  public interpretationInProgress = () => {
    return this.interpreter !== null;
  };
}
