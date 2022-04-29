import { WhereWhatPair, WorkflowFile } from "@wbr-project/wbr-interpret";
import { emptyWorkflow } from "../shared/constants";

const axios = require('axios').default;

export const getActiveWorkflow = async(id: string) : Promise<WorkflowFile> => {
  try {
    const response = await axios.get(`http://localhost:8080/workflow/${id}`)
    console.log(response);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Something went wrong when fetching a recorded workflow');
    }
  } catch(error: any) {
    console.log(error);
    return emptyWorkflow;
  }
};

export const deletePair = async(index: number): Promise<WorkflowFile> => {
  try {
   const response = await axios.delete(`http://localhost:8080/workflow/pair/${index}`);
    console.log(response);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Something went wrong when fetching an updated workflow');
    }
  } catch (error: any) {
    console.log(error);
    return emptyWorkflow;
  }
};

export const AddPair = async(index: number, pair: WhereWhatPair): Promise<WorkflowFile> => {
  try {
    const response = await axios.post(`http://localhost:8080/workflow/pair/${index}`, {
      pair,
    });
    console.log(response);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Something went wrong when fetching an updated workflow');
    }
  } catch (error: any) {
    console.log(error);
    return emptyWorkflow;
  }
};
