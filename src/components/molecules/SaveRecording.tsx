import React, { useState } from 'react';
import Button from "@mui/material/Button";
import { GenericModal } from "../atoms/GenericModal";
import { stopRecording } from "../../api/recording";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { useSocketStore } from "../../context/socket";
import { TextField } from "@mui/material";

interface SaveRecordingProps {
  workflowLength: number;
}

export const SaveRecording = ({workflowLength}: SaveRecordingProps) => {

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState<string>('');

  const { browserId, setBrowserId } =  useGlobalInfoStore();
  const { socket } = useSocketStore();

  const handleChangeOfTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setRecordingName(value);
  }

  const handleSaveRecording = () => {
    socket?.emit('save', recordingName)
    if (browserId) {
      stopRecording(browserId);
    }
    setBrowserId(null);
  };

  return (
    <div>
      <Button sx={{
          background: workflowLength === 0 ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.8)',
          color: '#fff',
          borderRadius: '0%',
          '&:hover': {background: '#1976d2'}
        }} onClick={() => setOpenModal(true)} disabled={workflowLength === 0}>
          Finish Recording
        </Button>

      <GenericModal isOpen={openModal} onClose={() => setOpenModal(false)} modalStyle={modalStyle}>
        <form onSubmit={handleSaveRecording} style={{paddingTop:'50px'}}>
          <TextField
            required
            sx={{width: '250px', paddingBottom: '10px'}}
            onChange={handleChangeOfTitle}
            id="title"
            label="Recording title"
            variant="outlined"
          />
          <Button type="submit">Save</Button>
        </form>
      </GenericModal>
    </div>
  );
}

const modalStyle = {
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '20%',
  backgroundColor: 'background.paper',
  p: 4,
  height:'20%',
  display:'block',
  padding: '5px 25px 10px 25px',
};
