import React, { FC, useState } from 'react';
import { Stack, Button, IconButton } from "@mui/material";
import { AddPair, deletePair, UpdatePair } from "../../api/workflow";
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { ClearButton } from "../atoms/buttons/ClearButton";
import { GenericModal } from "../atoms/GenericModal";
import { PairEditForm } from "./PairEditForm";
import { PairDisplayDiv } from "../atoms/PairDisplayDiv";
import TreeItem from "@mui/lab/TreeItem";
import { EditButton } from "../atoms/buttons/EditButton";
import { BreakpointButton } from "../atoms/buttons/BreakpointButton";
import VisibilityIcon from '@mui/icons-material/Visibility';
import styled from "styled-components";
import { LoadingButton } from "@mui/lab";

type WhereWhatPair = WorkflowFile["workflow"][number];


interface PairProps {
  handleBreakpoint: () => void;
  isActive: boolean;
  index: number;
  pair: WhereWhatPair;
  updateWorkflow: (workflow: WorkflowFile) => void;
  numberOfPairs: number;
  handleSelectPairForEdit: (pair: WhereWhatPair, index: number) => void;
}


export const Pair: FC<PairProps> = (
  {
    handleBreakpoint, isActive, index,
    pair, updateWorkflow, numberOfPairs,
    handleSelectPairForEdit
  }) => {
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

  const handleBreakpointClick = () => {
    setBreakpoint(!breakpoint);
    handleBreakpoint();
  };

  return (
    <PairWrapper isActive={isActive}>
      <Stack direction="row">
        <div style={{display: 'flex', maxWidth:'20px', alignItems:'center', justifyContent: 'center',
          marginLeft: '5px',}}>
          {isActive ? <LoadingButton loading variant="text"/>
            : breakpoint ? <BreakpointButton changeColor={true} handleClick={handleBreakpointClick}/>
              : <BreakpointButton handleClick={handleBreakpointClick}/>
          }
        </div>
        <Button sx={{
          position: 'relative',
          left: '6%',
          color: 'black',
          padding: '5px 35%',
          fontSize: '1rem',
        }} variant='text' key={`pair-${index}`}
        onClick={() => handleSelectPairForEdit(pair, index)}>
          {index}
        </Button>
        <Stack direction="row" spacing={0}
        sx={{
          color: 'inherit',
          "&:hover": {
            color: 'inherit',
          }
        }}>
          <ViewButton
            handleClick={handleOpen}
          />
          <EditButton
            handleClick={() => {
              enableEdit();
              handleOpen();
            }}
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
          </div>
        }
      </GenericModal>
    </PairWrapper>
    );
};

interface ViewButtonProps {
  handleClick: () => void;
}

const ViewButton = ({handleClick}: ViewButtonProps) => {
  return (
    <IconButton aria-label="add" size={"small"} onClick={handleClick}
                sx={{color: 'inherit', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}>
      <VisibilityIcon/>
    </IconButton>
  );
}


const PairWrapper = styled.div<{ isActive: boolean }>`
  background-color: ${({ isActive }) => isActive ? 'rgba(255, 0, 0, 0.1)' : 'transparent' };
  border: ${({ isActive }) => isActive ? 'solid 2px red' : 'none' };
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 98%;
  color: gray;
  &:hover { 
    color: dimgray; 
    background: ${({ isActive }) => isActive ? 'rgba(255, 0, 0, 0.1)' : 'transparent' };
  }
`;
