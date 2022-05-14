import React, { FC, useEffect, useState } from 'react';
import { Stack, Button } from "@mui/material";
import { AddPair, deletePair, UpdatePair } from "../../api/workflow";
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { ClearButton } from "../atoms/ClearButton";
import { GenericModal } from "../atoms/GenericModal";
import { PairEditForm } from "./PairEditForm";
import { PairDisplayDiv } from "../atoms/PairDisplayDiv";
import TreeItem from "@mui/lab/TreeItem";
import { EditButton } from "../atoms/EditButton";
import { BreakpointButton } from "../atoms/BreakpointButton";
import { useSocketStore } from "../../context/socket";

type WhereWhatPair = WorkflowFile["workflow"][number];


interface PairProps {
  isActive: boolean;
  index: number;
  pair: WhereWhatPair;
  updateWorkflow: (workflow: WorkflowFile) => void;
  numberOfPairs: number;
}

export const Pair: FC<PairProps> = ({ isActive, index, pair, updateWorkflow, numberOfPairs }) => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [breakpoint, setBreakpoint] = useState(false);

  const enableEdit = () => setEdit(true);
  const disableEdit = () => setEdit(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    disableEdit();
  }

  const handleDelete = () => {
    deletePair(index - 1).then((updatedWorkflow) => {
      updateWorkflow(updatedWorkflow);
    }).catch((error) => {
      console.error(error);
    });
  };

  const handleEdit = (pair: WhereWhatPair, newIndex: number) => {
    console.log(newIndex, index)
  if (newIndex !== index){
    AddPair((newIndex - 1), pair).then((updatedWorkflow) => {
      updateWorkflow(updatedWorkflow);
    }).catch((error) => {
      console.error(error);
    });
  } else {
    UpdatePair((index - 1), pair).then((updatedWorkflow) => {
      updateWorkflow(updatedWorkflow);
    }).catch((error) => {
      console.error(error);
    });
  }
    handleClose();
  };

  return (
    <div style={{
      backgroundColor: isActive ? 'rgba(25, 118, 210, 0.15)' : 'transparent',
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      width: "fit-content",
    }}>
      <Stack direction="row">
        <div style={{position: 'sticky', maxWidth:'20px'}}>
          {breakpoint
            ? <BreakpointButton  handleClick={() => setBreakpoint(false)}/>
            : <button style={{
              padding:'10px 15px',
              backgroundColor: 'transparent',
              borderRight: '3px solid gray',
              borderTop: 'none',
              borderBottom: 'none',
              borderLeft: 'none',
            }} onClick={()=>setBreakpoint(true)}/>
          }
        </div>
        <TreeItem sx={{
          padding: '4px',
          position: 'relative',
          left: '10%',
        }} nodeId={index.toString()} key={index.toString()} label={index}>
          {
            //eslint-disable-next-line
            pair.what.map((what, i) => {
              if (what) {
                const id = `${index.toString()}.${i.toString()}`;
                return <TreeItem nodeId={id} key={id} label={what.action}/>
              }
            })
          }
        </TreeItem>
        <Stack direction="row" spacing={0}
               style={{position: 'sticky', marginLeft:'50px'}}>
          <EditButton
            handleClick={handleOpen}
          />
          <ClearButton
            handleClick={handleDelete}
          />
        </Stack>
      </Stack>
      <GenericModal isOpen={open} onClose={handleClose}>
        { edit
          ?
            <PairEditForm
              onSubmitOfPair={handleEdit}
              numberOfPairs={numberOfPairs}
              index={index.toString()}
              title={index.toString()}
              where={pair.where ? JSON.stringify(pair.where) : undefined}
              what={pair.what ? JSON.stringify(pair.what) : undefined}
            />
          :
          <div>
            <PairDisplayDiv
              title={index.toString() || pair?.what[0]?.action}
              pair={pair}
            />
            <Button
              onClick={enableEdit}
              variant="contained"
            >
              Edit
            </Button>
          </div>
        }
      </GenericModal>
    </div>
    );
};
