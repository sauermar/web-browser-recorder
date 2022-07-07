import { Paper } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { getActiveWorkflow } from "../../api/workflow";
import { useSocketStore } from '../../context/socket';
import { WhereWhatPair, WorkflowFile } from "@wbr-project/wbr-interpret";
import { SidePanelHeader } from "../molecules/SidePanelHeader";
import { emptyWorkflow } from "../../shared/constants";
import { LeftSidePanelContent } from "../molecules/LeftSidePanelContent";
import { useBrowserDimensionsStore } from "../../context/browserDimensions";
import { useGlobalInfoStore } from "../../context/globalInfo";

const fetchWorkflow = (id: string, callback: (response: WorkflowFile) => void) => {
  getActiveWorkflow(id).then(
    (response ) => {
      if (response){
        callback(response);
      } else {
        throw new Error("No workflow found");
      }
    }
  ).catch((error) => {console.log(error.message)})
};

interface LeftSidePanelProps {
  sidePanelRef: HTMLDivElement | null;
  alreadyHasScrollbar: boolean;
  recordingName: string;
  handleSelectPairForEdit: (pair:WhereWhatPair, index:number) => void;
}

export const LeftSidePanel = (
  { sidePanelRef, alreadyHasScrollbar, recordingName, handleSelectPairForEdit }: LeftSidePanelProps) => {

  const [workflow, setWorkflow] = useState<WorkflowFile>(emptyWorkflow);
  const [hasScrollbar, setHasScrollbar] = useState<boolean>(alreadyHasScrollbar);

  const { id, socket } = useSocketStore();
  const { setWidth, width } = useBrowserDimensionsStore();
  const { setRecordingLength } = useGlobalInfoStore();

  const workflowHandler = useCallback((data: WorkflowFile) => {
    setWorkflow(data);
    setRecordingLength(data.workflow.length);
  }, [workflow])

  useEffect(() => {
    // fetch the workflow every time the id changes
    if (id) {
      fetchWorkflow(id, workflowHandler);
      console.log("Fetching workflow successful");
    }
    // fetch workflow in 15min intervals
    let interval = setInterval(() =>{
    if (id) {
      fetchWorkflow(id, workflowHandler);
      console.log("Fetching workflow successful");
    }}, (1000 * 60 * 15));
    return () => clearInterval(interval)
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on("workflow", workflowHandler);
    }

    if (sidePanelRef) {
      const workflowListHeight = sidePanelRef.clientHeight;
      const innerHeightWithoutNavbar = window.innerHeight - 70;
      if (innerHeightWithoutNavbar <= workflowListHeight) {
        if (!hasScrollbar) {
          setWidth(width - 10);
          setHasScrollbar(true);
        }
      } else {
        if (hasScrollbar && !alreadyHasScrollbar) {
          setWidth(width + 10);
          setHasScrollbar(false);
        }
      }
    }

    return () => {
      socket?.off('workflow', workflowHandler);
    }
  }, [socket, workflowHandler]);

  return (
    <Paper
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: 'lightgray',
        alignItems: "center",
      }}
    >
      <SidePanelHeader
        updateWorkflow={setWorkflow}
        numberOfPairs={workflow.workflow.length}
      />
      <LeftSidePanelContent
        workflow={workflow}
        updateWorkflow={setWorkflow}
        recordingName={recordingName}
        handleSelectPairForEdit={handleSelectPairForEdit}
      />
    </Paper>
  );

};
