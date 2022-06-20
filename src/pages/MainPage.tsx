import React, { useCallback, useEffect } from 'react';
import { MainMenu } from "../components/organisms/MainMenu";
import { Grid } from "@mui/material";
import { Recordings } from "../components/organisms/Recordings";
import { Runs } from "../components/organisms/Runs";
import { useGlobalInfoStore } from "../context/globalInfo";
import { createRunForStoredRecording, interpretStoredRecording } from "../api/storage";
import { io, Socket } from "socket.io-client";
import { stopRecording } from "../api/recording";

interface MainPageProps {
  handleEditRecording: (fileName: string) => void;
}

export const MainPage = ({ handleEditRecording }: MainPageProps) => {

  const [content, setContent] = React.useState('recordings');
  const [sockets, setSockets] = React.useState<Socket[]>([]);
  const [runningRecordingName, setRunningRecordingName] = React.useState('');
  const [currentInterpretationLog, setCurrentInterpretationLog] = React.useState('');

  const { notify, setRerenderRuns } = useGlobalInfoStore();

  const handleRunRecording = useCallback((fileName: string) => {
    setRunningRecordingName(fileName);
    createRunForStoredRecording(fileName).then(id => {
      const socket =
        io(`http://localhost:8080/${id}`, {
          transports: ["websocket"],
          rejectUnauthorized: false
        });
      setSockets(sockets => [...sockets, socket]);
      socket.on('connect', () => console.log('connected to socket'));
      socket.on('ready-for-run', () => {
        interpretStoredRecording(fileName).then(interpretation => {
          if (interpretation) {
            notify('success', `Interpretation of ${fileName} succeeded`);
          } else {
            notify('success', `Failed to interpret ${fileName} recording`);
            // stop the created browser
            stopRecording(id);
          }
          setRunningRecordingName('');
          setCurrentInterpretationLog('');
          setRerenderRuns(true);
        })
      })
      socket.on("connect_error", (err) => console.log(`connect_error due to ${err.message}`));
      socket.on('debugMessage', (msg: string) => {
        setCurrentInterpretationLog((prevState) =>
          prevState + '\n' + `[${new Date().toLocaleString()}] ` + msg);
      });
      setContent('runs');
      if (id) {
        notify('info', `Running recording: ${fileName}`);
      } else {
        notify('error', `Failed to run recording: ${fileName}`);
      }
    });
  }, [runningRecordingName])

  const DisplayContent = () => {
    switch (content) {
      case 'recordings':
        return <Recordings
          handleEditRecording={handleEditRecording}
          handleRunRecording={handleRunRecording}
        />;
      case 'tasks':
        return <h1>Tasks</h1>;
      case 'runs':
        return <Runs
          runningRecordingName={runningRecordingName}
          currentInterpretationLog={currentInterpretationLog}
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
