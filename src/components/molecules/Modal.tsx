import React, { FC, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Button } from "@mui/material";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface BasicModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const BasicModal: FC<BasicModalProps> = ({open, onClose, title, content}) => {
  const [edit, setEdit] = useState(false);
  const enableEdit = () => setEdit(true);
  const disableEdit = () => setEdit(false);

  return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          {edit ?
            <div>
              <TextareaAutosize
                maxRows={4}
                aria-label="maximum height"
                placeholder="Maximum 4 rows"
                defaultValue={content}
                style={{ width: 400 }}
              />
              <Button onClick={disableEdit} >Save</Button>
            </div>
            : <Typography id="modal-modal-description" sx={{ mt: 2 }} onClick={enableEdit}>
            {content}
          </Typography>}
        </Box>
      </Modal>
  );
}
