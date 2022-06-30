import React, { useCallback, useEffect } from 'react';
import { MainMenu } from "../components/organisms/MainMenu";
import { Grid } from "@mui/material";
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

export const MainPage = ({ handleEditRecording }: MainPageProps) => {

  const [content, setContent] = React.useState('recordings');
  const [sockets, setSockets] = React.useState<Socket[]>([]);
  const [runningRecordingName, setRunningRecordingName] = React.useState('');
  const [currentInterpretationLog, setCurrentInterpretationLog] = React.useState('');
  const [remoteBrowserId, setRemoteBrowserId] = React.useState('');

  let aborted = false;

  const { notify, setRerenderRuns } = useGlobalInfoStore();

  const abortRunHandler = () => {
    aborted = true;
    notifyAboutAbort(runningRecordingName).then(async (response) => {
      if (response) {
        notify('success', `Interpretation of ${runningRecordingName} aborted successfully`);
        await stopRecording(remoteBrowserId);
      } else {
        notify('error', `Failed to abort the interpretation ${runningRecordingName} recording`);
      }
    })
  }

  const setFileName = (fileName: string) => {
    setRunningRecordingName(fileName);
  }

  const readyForRunHandler = useCallback( (id: string) => {
    interpretStoredRecording(runningRecordingName).then( async (interpretation: boolean) => {
      console.log(`was aborted: ${aborted}`)
      if (!aborted) {
        if (interpretation) {
          notify('success', `Interpretation of ${runningRecordingName} succeeded`);
        } else {
          notify('success', `Failed to interpret ${runningRecordingName} recording`);
          // destroy the created browser
          await stopRecording(id);
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
    createRunForStoredRecording(runningRecordingName, settings).then(id => {
      setRemoteBrowserId(id);
      const socket =
        io(`http://localhost:8080/${id}`, {
          transports: ["websocket"],
          rejectUnauthorized: false
        });
      setSockets(sockets => [...sockets, socket]);
      socket.on('ready-for-run', () => readyForRunHandler(id))
      socket.on('debugMessage', debugMessageHandler);
      setContent('runs');
      if (id) {
        notify('info', `Running recording: ${runningRecordingName}`);
      } else {
        notify('error', `Failed to run recording: ${runningRecordingName}`);
      }
    });
    return (socket: Socket, id: string) => {
      socket.off('ready-for-run', () => readyForRunHandler(id));
      socket.off('debugMessage', debugMessageHandler);
    }
  }, [runningRecordingName, sockets, remoteBrowserId, readyForRunHandler, debugMessageHandler])

  const DisplayContent = () => {
    switch (content) {
      case 'recordings':
        return <Recordings
          handleEditRecording={handleEditRecording}
          handleRunRecording={handleRunRecording}
          setFileName={setFileName}
        />;
      case 'tasks':
        return <h1>Tasks</h1>;
      case 'runs':
        return <Runs
          runningRecordingName={runningRecordingName}
          currentInterpretationLog={currentInterpretationLog}
          abortRunHandler={abortRunHandler}
        />;
      default:
        return null;
    }
  }

  return (
    <Grid container direction="row" spacing={0}>
      <Grid item xs={ 2 } style={{ display: "flex", flexDirection: "row" }}>
        <MainMenu value={content} handleChangeContent={setContent}/>
      </Grid>
      <Grid item xs>
        { DisplayContent() }
      </Grid>
    </Grid>
  );
};
