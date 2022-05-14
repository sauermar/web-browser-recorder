import Interpreter, { WorkflowFile } from "@wbr-project/wbr-interpret";
import fs from "fs";
import logger from "../../logger";
import { Socket } from "socket.io";
import { Page } from "playwright";


export class WorkflowInterpreter {

  private interpreter: Interpreter | null = null;

  private activeId: number | null = null;

  private debugMessages: string[] = [];

  public breakpoints: boolean[] = [];

  public interpretRecording = async (
    socket: Socket,
    workflow: WorkflowFile,
    page: Page,
    flagCallback: (page: Page, resume: () => void) => void,
    breakpointHitCallback: () => void
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
        breakpointHitCallback();
      }
      flagCallback(page, resume);
    });

    await interpreter.run(page);

    logger.log('debug',`Interpretation finished`);
    this.interpreter = null;
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
}
