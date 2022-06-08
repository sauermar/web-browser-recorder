import React, { useEffect } from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { TreeView } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Pair } from "./Pair";
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { useSocketStore } from "../../context/socket";
import { SaveRecording } from "./SaveRecording";

interface LeftSidePanelContentProps {
  workflow: WorkflowFile;
  updateWorkflow: (workflow: WorkflowFile) => void;
  recordingName: string;
}

export const LeftSidePanelContent = ({ workflow, updateWorkflow, recordingName}: LeftSidePanelContentProps) => {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [activeId, setActiveId] = React.useState<number>(0);
  const [breakpoints, setBreakpoints] = React.useState<boolean[]>([]);

  const { socket } = useSocketStore();

  useEffect(() => {
    if (socket) {
      socket.on("activePairId", data => {
        setActiveId(parseInt(data) + 1);
      });
      socket?.on('finished', () => {
        setActiveId(0);
      });
    }
  }, [socket, setActiveId]);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleExpandClick = () => {
    setExpanded((oldExpanded) => {
      const newArray = [...Array(workflow.workflow.length + 1).keys()].map(x => x++).map(x => x.toString());
      return oldExpanded.length === 0 ? newArray: []
    });
  };

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
      <Box sx={{ mb: 1, display: 'flex', width: '240px' }} >
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
        </Button>
        <SaveRecording workflowLength={workflow.workflow.length} fileName={recordingName}/>
      </Box>
      <TreeView
        aria-label="controlled"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        onNodeToggle={handleToggle}
        multiSelect
      >
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
            />)
        }
      </TreeView>
    </Box>
  );
};
