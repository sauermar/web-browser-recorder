import { AxiosResponse } from "axios";
import { WorkflowFile } from "@wbr-project/wbr-interpret";

const axios = require('axios').default;


export const startRecording = async() : Promise<string> => {
  try {
    const response = await axios.get('http://localhost:8080/record/start')
    console.log(response);
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error('Couldn\'t start recording');
    }
  } catch(error: any) {
    console.log(error);
    return '';
  }
};

export const stopRecording = (id: string): void => {
    axios.get(`http://localhost:8080/record/stop/${id}`)
        .then((response : AxiosResponse<boolean>)  => {
            console.log(response);
        })
        .catch((error: any) => {
            console.log(error);
        });
};

//TODO this is for development only, needs to be rewritten
export const getActiveBrowserId = async(): Promise<string> => {
    try {
        const response = await axios.get('http://localhost:8080/record/active');
        console.log(response);
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Couldn\'t get active browser');
        }
    } catch(error: any) {
        console.log(error);
        return '';
    }
};

export const interpretCurrentRecording = async(): Promise<void> => {
    try {
        const response = await axios.get('http://localhost:8080/record/interpret');
        console.log(response);
        if (response.status === 200) {
            return;
        } else {
            throw new Error('Couldn\'t interpret current recording');
        }
    } catch(error: any) {
        console.log(error);
    }
};

export const stopCurrentInterpretation = async(): Promise<void> => {
  try {
    const response = await axios.get('http://localhost:8080/record/interpret/stop');
    console.log(response);
    if (response.status === 200) {
      return;
    } else {
      throw new Error('Couldn\'t interpret current recording');
    }
  } catch(error: any) {
    console.log(error);
  }
};

export const getStoredRecordings = async (): Promise<string[] | null> => {
  try {
    const response = await axios.get('http://localhost:8080/recordings');
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
    const response = await axios.delete(`http://localhost:8080/recordings/${fileName}`);
    console.log(response);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Couldn\'t delete stored recording ${fileName}`);
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
      throw new Error(`Couldn\'t edit stored recording ${fileName}`);
    }
  } catch(error: any) {
    console.log(error);
    return null;
  }
};
