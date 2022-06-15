import * as React from 'react';
import { Box, Tab, Tabs } from "@mui/material";
import { AddButton } from "../atoms/AddButton";
import { useBrowserDimensionsStore } from "../../context/browserDimensions";

interface BrowserTabsProp {
  tabs: string[],
  handleTabChange: (index: number) => void,
  handleAddNewTab: () => void,
}

export const BrowserTabs = ({ tabs, handleTabChange, handleAddNewTab }: BrowserTabsProp) => {
  const [value, setValue] = React.useState(0);

  const { width } = useBrowserDimensionsStore();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: `${width}px`, display: 'flex', overflow: 'auto'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
        >
          {tabs.map((tab, index) => {
            return (
              <Tab
                id={`tab-${index}`}
                onClick={() => handleTabChange(index)}
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
