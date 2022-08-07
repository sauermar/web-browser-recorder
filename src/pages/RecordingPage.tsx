import React, { useCallback, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { BrowserContent } from "../components/organisms/BrowserContent";
import { startRecording, getActiveBrowserId } from "../api/recording";
import { LeftSidePanel } from "../components/organisms/LeftSidePanel";
import { RightSidePanel } from "../components/organisms/RightSidePanel";
import { Loader } from "../components/atoms/Loader";
import { useSocketStore } from "../context/socket";
import { useBrowserDimensionsStore } from "../context/browserDimensions";
import { useGlobalInfoStore } from "../context/globalInfo";
import { editRecordingFromStorage } from "../api/storage";
import { WhereWhatPair } from "@wbr-project/wbr-interpret";

interface RecordingPageProps {
  recordingName?: string;
}

export interface PairForEdit {
  pair: WhereWhatPair | null,
  index: number,
}

export const RecordingPage = ({ recordingName }: RecordingPageProps) => {

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasScrollbar, setHasScrollbar] = React.useState(false);
  const [pairForEdit, setPairForEdit] = useState<PairForEdit>({
    pair: null,
    index: 0,
  });

  const browserContentRef = React.useRef<HTMLDivElement>(null);
  const workflowListRef = React.useRef<HTMLDivElement>(null);

  const { setId, socket } = useSocketStore();
  const { setWidth } = useBrowserDimensionsStore();
  const { browserId, setBrowserId } = useGlobalInfoStore();

  const handleSelectPairForEdit = (pair: WhereWhatPair, index: number) => {
    setPairForEdit({
      pair,
      index,
    });
  };

  //resize browser content when loaded event is fired
   useEffect(() => changeBrowserDimensions(), [isLoaded])

  useEffect(() => {
    let isCancelled = false;
    const handleRecording = async () => {
      const id = await getActiveBrowserId();
      if (!isCancelled) {
        if (id) {
          setId(id);
          setBrowserId(id);
          setIsLoaded(true);
        } else {
          const newId = await startRecording()
          setId(newId);
          setBrowserId(newId);
        }
      }
    };

    handleRecording();

    return () => {
      isCancelled = true;
    }
  }, [setId]);

  const changeBrowserDimensions = useCallback(() => {
    if (browserContentRef.current) {
      const currentWidth = Math.floor(browserContentRef.current.getBoundingClientRect().width);
      const innerHeightWithoutNavBar = window.innerHeight - 54.5;
      if ( innerHeightWithoutNavBar <= (currentWidth / 1.6)) {
        setWidth(currentWidth - 10);
        setHasScrollbar(true);
      } else {
        setWidth(currentWidth);
      }
      socket?.emit("rerender");
    }
  }, [socket]);

  const handleLoaded = useCallback(() => {
    if (recordingName && browserId) {
      editRecordingFromStorage(browserId, recordingName).then(() => setIsLoaded(true));
    } else {
      if (browserId === 'new-recording') {
        socket?.emit('new-recording');
      }
      setIsLoaded(true);
    }
  }, [socket, browserId, recordingName, isLoaded])

  useEffect(() => {
    socket?.on('loaded', handleLoaded);
    return () => {
      socket?.off('loaded', handleLoaded)
    }
  }, [socket, handleLoaded]);

  return (
    <div>
      {isLoaded ?
        <Grid container direction="row" spacing={0}>
          <Grid item xs={2} ref={workflowListRef} style={{ display: "flex", flexDirection: "row" }}>
            <LeftSidePanel
              sidePanelRef={workflowListRef.current}
              alreadyHasScrollbar={hasScrollbar}
              recordingName={recordingName ? recordingName : ''}
              handleSelectPairForEdit={handleSelectPairForEdit}
            />
          </Grid>
          <Grid id="browser-content" ref={browserContentRef} item xs>
            <BrowserContent/>
          </Grid>
          <Grid item xs={2}>
            <RightSidePanel pairForEdit={pairForEdit} changeBrowserDimensions={changeBrowserDimensions}/>
          </Grid>
        </Grid>
        : <Loader/>}
    </div>
  );
};
