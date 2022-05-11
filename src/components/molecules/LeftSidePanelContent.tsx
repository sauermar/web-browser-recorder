import React from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { TreeView } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Pair } from "./Pair";
import { WorkflowFile } from "@wbr-project/wbr-interpret";

interface LeftSidePanelContentProps {
  workflow: WorkflowFile;
  updateWorkflow: (workflow: WorkflowFile) => void;
}

export const LeftSidePanelContent = ({ workflow, updateWorkflow}: LeftSidePanelContentProps) => {
  const [expanded, setExpanded] = React.useState<string[]>([]);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleExpandClick = () => {
    setExpanded((oldExpanded) => {
      const newArray = [...Array(workflow.workflow.length + 1).keys()].map(x => x++).map(x => x.toString());
      return oldExpanded.length === 0 ? newArray: []
    });
  };

  return (
    <Box sx={{ flexGrow: 1, maxWidth: 150 }}>
      <Box sx={{ mb: 1 }}>
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
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