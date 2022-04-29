import React, { FC } from 'react';
import { Modal, IconButton, Box } from '@mui/material';
import { Clear } from "@mui/icons-material";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: JSX.Element;
}

export const GenericModal: FC<ModalProps> = ({ isOpen, onClose, children }) => {

  return (
        <Modal open={isOpen} onClose={onClose}>
          <Box sx={modalStyle}>
          <IconButton onClick={onClose} sx={{float: "right"}}>
            <Clear sx={{ fontSize: 20 }}/>
          </IconButton>
            {children}
          </Box>
        </Modal>
    );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
