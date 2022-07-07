import React, { useCallback, useEffect } from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { TreeView } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Pair } from "./Pair";
import { WhereWhatPair, WorkflowFile } from "@wbr-project/wbr-interpret";
import { useSocketStore } from "../../context/socket";
import { SaveRecording } from "./SaveRecording";
import { Socket } from "socket.io-client";

interface LeftSidePanelContentProps {
  workflow: WorkflowFile;
  updateWorkflow: (workflow: WorkflowFile) => void;
  recordingName: string;
  handleSelectPairForEdit: (pair: WhereWhatPair, index: number) => void;
}

export const LeftSidePanelContent = ({ workflow, updateWorkflow, recordingName, handleSelectPairForEdit}: LeftSidePanelContentProps) => {
  const [activeId, setActiveId] = React.useState<number>(0);
  const [breakpoints, setBreakpoints] = React.useState<boolean[]>([]);

  const { socket } = useSocketStore();

  const activePairIdHandler = useCallback((data: string, socket: Socket) => {
    setActiveId(parseInt(data) + 1);
    // -1 is specially emitted when the interpretation finishes
    if (parseInt(data) === -1) {
      return;
    }
    socket.emit('activeIndex', data);
  }, [activeId])

  useEffect(() => {
    socket?.on("activePairId", (data) => activePairIdHandler(data, socket));
    return () => {
      socket?.off("activePairId", (data) => activePairIdHandler(data, socket));
    }
  }, [socket, setActiveId]);


  const handleBreakpointClick = (id: number) => {
    setBreakpoints(oldBreakpoints => {
      const newArray = [...oldBreakpoints, ...Array(workflow.workflow.length - oldBreakpoints.length).fill(false)];
      newArray[id] = !newArray[id];
      socket?.emit("breakpoints", newArray);
      return newArray;
    });
  };

  return (
    <Box sx={{ flexGrow: 1, maxWidth: 150 }}>
        {
          workflow.workflow.map((pair, i, workflow, ) =>
            <Pair
              handleBreakpoint={() => handleBreakpointClick(i)}
              isActive={ activeId === i + 1}
              key={workflow.length - i}
              index={workflow.length - i}
              pair={pair}
              updateWorkflow={updateWorkflow}
              numberOfPairs={workflow.length}
              handleSelectPairForEdit={handleSelectPairForEdit}
            />)
        }
    </Box>
  );
};
