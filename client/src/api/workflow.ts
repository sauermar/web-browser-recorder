import {WorkflowFile} from "@wbr-project/wbr-interpret";

const axios = require('axios').default;

export const getActiveWorkflow = async(id: string) : Promise<WorkflowFile | null> => {
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
    return null;
  }
};
