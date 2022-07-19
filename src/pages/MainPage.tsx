import React, { useCallback, useEffect } from 'react';
import { MainMenu } from "../components/organisms/MainMenu";
import { Grid, Stack } from "@mui/material";
import { Recordings } from "../components/organisms/Recordings";
import { Runs } from "../components/organisms/Runs";
import { useGlobalInfoStore } from "../context/globalInfo";
import { createRunForStoredRecording, interpretStoredRecording, notifyAboutAbort } from "../api/storage";
import { io, Socket } from "socket.io-client";
import { stopRecording } from "../api/recording";
import { RunSettings } from "../components/molecules/RunSettings";

interface MainPageProps {
  handleEditRecording: (fileName: string) => void;
}

export interface CreateRunResponse {
  browserId: string;
  runId: string;
}

export const MainPage = ({ handleEditRecording }: MainPageProps) => {

  const [content, setContent] = React.useState('recordings');
  const [sockets, setSockets] = React.useState<Socket[]>([]);
  const [runningRecordingName, setRunningRecordingName] = React.useState('');
  const [currentInterpretationLog, setCurrentInterpretationLog] = React.useState('');
  const [ids, setIds] = React.useState<CreateRunResponse>({
    browserId: '',
    runId: ''
  });

  let aborted = false;

  const { notify, setRerenderRuns } = useGlobalInfoStore();

  const abortRunHandler = (runId: string) => {
    aborted = true;
    notifyAboutAbort(runningRecordingName, runId).then(async (response) => {
      if (response) {
        notify('success', `Interpretation of ${runningRecordingName} aborted successfully`);
        await stopRecording(ids.browserId);
      } else {
        notify('error', `Failed to abort the interpretation ${runningRecordingName} recording`);
      }
    })
  }

  const setFileName = (fileName: string) => {
    setRunningRecordingName(fileName);
  }

  const readyForRunHandler = useCallback( (browserId: string, runId: string) => {
    interpretStoredRecording(runningRecordingName, runId).then( async (interpretation: boolean) => {
      console.log(`was aborted: ${aborted}`)
      if (!aborted) {
        if (interpretation) {
          notify('success', `Interpretation of ${runningRecordingName} succeeded`);
        } else {
          notify('success', `Failed to interpret ${runningRecordingName} recording`);
          // destroy the created browser
          await stopRecording(browserId);
        }
      }
      setRunningRecordingName('');
      setCurrentInterpretationLog('');
      setRerenderRuns(true);
    })
  }, [runningRecordingName, aborted, currentInterpretationLog, notify, setRerenderRuns]);

  const debugMessageHandler = useCallback((msg: string) => {
    setCurrentInterpretationLog((prevState) =>
      prevState + '\n' + `[${new Date().toLocaleString()}] ` + msg);
  }, [currentInterpretationLog])

  const handleRunRecording = useCallback((settings: RunSettings) => {
    createRunForStoredRecording(runningRecordingName, settings).then(({browserId, runId}: CreateRunResponse) => {
      setIds({browserId, runId});
      const socket =
        io(`http://localhost:8080/${browserId}`, {
          transports: ["websocket"],
          rejectUnauthorized: false
        });
      setSockets(sockets => [...sockets, socket]);
      socket.on('ready-for-run', () => readyForRunHandler(browserId, runId));
      socket.on('debugMessage', debugMessageHandler);
      setContent('runs');
      if (browserId) {
        notify('info', `Running recording: ${runningRecordingName}`);
      } else {
        notify('error', `Failed to run recording: ${runningRecordingName}`);
      }
    });
    return (socket: Socket, browserId: string, runId: string) => {
      socket.off('ready-for-run', () => readyForRunHandler(browserId, runId));
      socket.off('debugMessage', debugMessageHandler);
    }
  }, [runningRecordingName, sockets, ids, readyForRunHandler, debugMessageHandler])

  const DisplayContent = () => {
    switch (content) {
      case 'recordings':
        return <Recordings
          handleEditRecording={handleEditRecording}
          handleRunRecording={handleRunRecording}
          setFileName={setFileName}
        />;
      case 'runs':
        return <Runs
          currentInterpretationLog={currentInterpretationLog}
          abortRunHandler={() => abortRunHandler(ids.runId)}
          runId={ids.runId}
          runningRecordingName={runningRecordingName}
        />;
      default:
        return null;
    }
  }

  return (
    <Stack direction='row' spacing={0} sx={{minHeight: '800px'}}>
        <MainMenu value={content} handleChangeContent={setContent}/>
      { DisplayContent() }
    </Stack>
  );
};
