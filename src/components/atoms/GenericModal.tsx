import React, { FC } from 'react';
import { Modal, Button, IconButton, Box, TextField } from '@mui/material';
import { Clear } from "@mui/icons-material";
import { Preprocessor, WhereWhatPair } from "@wbr-project/wbr-interpret";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOfPair: (value: WhereWhatPair) => void;
}

interface TextFieldsObject {
  where: string | null;
  what: string | null;
}

export const GenericModal: FC<ModalProps> = ({ isOpen, onSubmitOfPair, onClose }) => {
  const [textFields, setTextFields] = React.useState<TextFieldsObject>({
    where: null,
    what: null,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setTextFields({ ...textFields, [id]: value });
  };

  const handleSubmit = () => {
    try {
      const whereWhatPair = {
        where: textFields.where ? JSON.parse(textFields.where) : {},
        what: textFields.what ? JSON.parse(textFields.what): [],
      };
      const result = Preprocessor.validateWorkflow({workflow: [whereWhatPair]});
      console.log(result);
      onSubmitOfPair(whereWhatPair);
      onClose();
    } catch (e) {
      const { message } = e as Error;
      alert(message);
    }
  };

  return (
        <Modal open={isOpen} onClose={onClose}>
          <Box>
          <IconButton onClick={onClose}>
            <Clear sx={{ fontSize: 20 }}/>
          </IconButton>
            <form onSubmit={handleSubmit}>
              <TextField id="where" label="Where" variant="outlined" onChange={handleInputChange}>{}</TextField>
              <TextField id="what" label="What" variant="outlined" onChange={handleInputChange}>[{}]</TextField>
              <Button type="submit" >Submit</Button>
            </form>
          </Box>
        </Modal>
    );
};
