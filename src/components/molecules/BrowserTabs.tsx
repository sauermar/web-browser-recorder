import * as React from 'react';
import { Box, Tab, Tabs } from "@mui/material";

interface BrowserTabsProp {
  tabs: string[],
  handleTabChange: (index: number) => void,
}

export const BrowserTabs = ({ tabs, handleTabChange }: BrowserTabsProp) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
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
    </Box>
  );
}
