import { AxiosResponse } from "axios";

const axios = require('axios').default;


export const startRecording = () : string|void => {
    axios.get('http://localhost:8080/record/start')
        .then((response : AxiosResponse<string>)  => {
            console.log(response);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Couldn\'t start recording');
            }
        })
        .catch((error: any) => {
            console.log(error);
        });
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
