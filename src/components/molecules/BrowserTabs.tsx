import * as React from 'react';
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { AddButton } from "../atoms/buttons/AddButton";
import { useBrowserDimensionsStore } from "../../context/browserDimensions";
import { Close } from "@mui/icons-material";

interface BrowserTabsProp {
  tabs: string[],
  handleTabChange: (index: number) => void,
  handleAddNewTab: () => void,
  handleCloseTab: (index: number) => void,
  handleChangeIndex: (index: number) => void;
  tabIndex: number
}

export const BrowserTabs = (
  {
    tabs, handleTabChange, handleAddNewTab,
    handleCloseTab, handleChangeIndex, tabIndex
  }: BrowserTabsProp) => {

  let tabWasClosed = false;

  const { width } = useBrowserDimensionsStore();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (!tabWasClosed) {
      handleChangeIndex(newValue);
    }
  };

  return (
    <Box sx={{
      width: `${width}px`,
      display: 'flex',
      overflow: 'auto',
      alignItems: 'center',
    }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
        >
          {tabs.map((tab, index) => {
            return (
              <Tab
                key={`tab-${index}`}
                id={`tab-${index}`}
                icon={<CloseButton closeTab={() => {
                  tabWasClosed = true;
                  handleCloseTab(index);
                }} disabled={tabs.length === 1}
                />}
                iconPosition="end"
                onClick={() => {
                  if (!tabWasClosed) {
                    handleTabChange(index)
                  }
                }
                }
                label={tab}
              />
            );
          })}
        </Tabs>
      </Box>
      <AddButton handleClick={handleAddNewTab}/>
    </Box>
  );
}

interface CloseButtonProps {
  closeTab: () => void;
  disabled: boolean;
}

const CloseButton = ({ closeTab, disabled }: CloseButtonProps) => {
  return (
    <IconButton
      aria-label="close"
      size={"small"}
      onClick={closeTab}
      disabled={disabled}
      sx={{ height: '34px',
        '&:hover': { color: 'white', backgroundColor: '#1976d2' } }}
      component="span"
    >
      <Close/>
    </IconButton>
  );
}
