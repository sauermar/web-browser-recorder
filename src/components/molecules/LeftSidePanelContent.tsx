import React, { useEffect } from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { TreeView } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Pair } from "./Pair";
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { useSocketStore } from "../../context/socket";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { stopRecording } from "../../api/recording";

interface LeftSidePanelContentProps {
  workflow: WorkflowFile;
  updateWorkflow: (workflow: WorkflowFile) => void;
}

export const LeftSidePanelContent = ({ workflow, updateWorkflow}: LeftSidePanelContentProps) => {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [activeId, setActiveId] = React.useState<number>(0);
  const [breakpoints, setBreakpoints] = React.useState<boolean[]>([]);

  const { socket } = useSocketStore();
  const { browserId, setBrowserId } =  useGlobalInfoStore();

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

  const handleSaveRecording = () => {
    socket?.emit('save');
    if (browserId) {
      stopRecording(browserId);
    }
    setBrowserId(null);
  };

  return (
    <Box sx={{ flexGrow: 1, maxWidth: 150 }}>
      <Box sx={{ mb: 1, display: 'flex', width: '240px' }} >
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
        </Button>
        <Button sx={{
          background: workflow.workflow.length === 0 ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.8)',
          color: '#fff',
          borderRadius: '0%',
          '&:hover': {background: '#1976d2'}
        }} onClick={handleSaveRecording} disabled={workflow.workflow.length === 0}>
         Save Recording
        </Button>
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
