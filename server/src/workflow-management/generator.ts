import { Coordinates } from "../interfaces/Input";
import { WorkflowFile } from '@wbr-project/wbr-interpret';
import { WhereWhatPair } from "@wbr-project/wbr-interpret/build/workflow";
import logger from "../logger";

export class WorkflowGenerator {

  private workflowRecord: WorkflowFile = {
    workflow: [],
  };

  private addPairToWorkflow = (pair: WhereWhatPair) => {
      this.workflowRecord.workflow.push(pair);
      logger.log('debug', `${pair}: Added to workflow file.`);
  } ;

  public onClick = (coordinates: Coordinates) => {
      const pair: WhereWhatPair = {
        where: {},
        what: [{
          action: 'click',
          args: [
            {
              position: coordinates,
            }
          ],
        }],
      }
      this.addPairToWorkflow(pair);
  };

  public getWorkflowFile = () => {
    return this.workflowRecord;
  };
}
