import { default as axios } from "axios";
import { WorkflowFile } from "@wbr-project/wbr-interpret";

export const getStoredRecordings = async (): Promise<string[] | null> => {
  try {
    const response = await axios.get('http://localhost:8080/storage/recordings');
    console.log(response);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Couldn\'t retrieve stored recordings');
    }
  } catch(error: any) {
    console.log(error);
    return null;
  }
};

export const getStoredRuns = async (): Promise<string[] | null> => {
  try {
    const response = await axios.get('http://localhost:8080/storage/runs');
    console.log(response);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Couldn\'t retrieve stored recordings');
    }
  } catch(error: any) {
    console.log(error);
    return null;
  }
};

export const deleteRecordingFromStorage = async (fileName: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`http://localhost:8080/storage/recordings/${fileName}`);
    console.log(response);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Couldn't delete stored recording ${fileName}`);
    }
  } catch(error: any) {
    console.log(error);
    return false;
  }
};

export const deleteRunFromStorage = async (fileName: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`http://localhost:8080/storage/runs/${fileName}`);
    console.log(response);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Couldn't delete stored recording ${fileName}`);
    }
  } catch(error: any) {
    console.log(error);
    return false;
  }
};

export const editRecordingFromStorage = async (browserId: string, fileName: string): Promise<WorkflowFile | null> => {
  try {
    const response = await axios.put(`http://localhost:8080/workflow/${browserId}/${fileName}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Couldn't edit stored recording ${fileName}`);
    }
  } catch(error: any) {
    console.log(error);
    return null;
  }
};

export const createRunForStoredRecording = async (fileName: string): Promise<string> => {
  try {
    const response = await axios.put(`http://localhost:8080/storage/runs/${fileName}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Couldn't create a run for a recording ${fileName}`);
    }
  } catch(error: any) {
    console.log(error);
    return '';
  }
}

export const interpretStoredRecording = async (fileName: string): Promise<boolean> => {
  try {
    const response = await axios.get(`http://localhost:8080/storage/runs/run/${fileName}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Couldn't run a recording ${fileName}`);
    }
  } catch(error: any) {
    console.log(error);
    return false;
  }
}


