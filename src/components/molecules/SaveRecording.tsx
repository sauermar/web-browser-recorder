import React, { useState } from 'react';
import { IconButton, Button } from "@mui/material";
import { GenericModal } from "../atoms/GenericModal";
import { stopRecording } from "../../api/recording";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { useSocketStore } from "../../context/socket";
import { TextField, Typography } from "@mui/material";
import { WarningText } from "../atoms/texts";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import FlagIcon from '@mui/icons-material/Flag';

interface SaveRecordingProps {
  fileName: string;
}

export const SaveRecording = ({fileName}: SaveRecordingProps) => {

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [needConfirm, setNeedConfirm] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState<string>(fileName);

  const { browserId, setBrowserId, notify, recordings } =  useGlobalInfoStore();
  const { socket } = useSocketStore();

  const handleChangeOfTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (needConfirm) {
      setNeedConfirm(false);
    }
    setRecordingName(value);
  }

  const handleSaveRecording = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (recordings.includes(recordingName)) {
      if (needConfirm) { return; }
      setNeedConfirm(true);
    } else {
      await saveRecording();
    }
  };

  // notifies backed to save the recording in progress,
  // releases resources and changes the view for main page by clearing the global browserId
  const saveRecording = async () => {
    socket?.emit('save', recordingName)
    notify('success', 'Recording saved successfully');
    if (browserId) {
      await stopRecording(browserId);
    }
    setBrowserId(null);
  }

  return (
    <div>
      <Button sx={{
        width:'100px',
        background: 'white',
        color: 'rgba(0,128,0,0.7)',
        '&:hover': {background: 'white', color: 'green'},
        padding: '11px',
        marginRight: '10px',
      }} onClick={() => setOpenModal(true)}>
        <FlagIcon sx={{marginRight:'3px'}}/> FINISH
      </Button>

      <GenericModal isOpen={openModal} onClose={() => setOpenModal(false)} modalStyle={modalStyle}>
        <form onSubmit={handleSaveRecording} style={{paddingTop:'50px', display: 'flex', flexDirection: 'column'}} >
          <Typography>Save the recording as:</Typography>
          <TextField
            required
            sx={{width: '250px', paddingBottom: '10px', margin: '15px 0px'}}
            onChange={handleChangeOfTitle}
            id="title"
            label="Recording title"
            variant="outlined"
            defaultValue={recordingName ? recordingName : null}
          />
            { needConfirm
              ?
              (<React.Fragment>
                <Button color="error" variant="contained" onClick={saveRecording}>Confirm</Button>
                <WarningText>
                  <NotificationImportantIcon color="warning"/>
                  Recording already exists, please confirm the recording's overwrite.
                </WarningText>
              </React.Fragment>)
              : <Button type="submit" variant="contained">Save</Button>
            }
        </form>
      </GenericModal>
    </div>
  );
}

const modalStyle = {
  top: '25%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '20%',
  backgroundColor: 'background.paper',
  p: 4,
  height:'fit-content',
  display:'block',
  padding: '20px',
};
