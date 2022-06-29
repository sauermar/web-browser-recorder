import React, { useRef } from 'react';
import styled from "styled-components";
import { Button } from "@mui/material";
import { ActionDescription } from "../organisms/RightSidePanel";
import * as Settings from "./action-settings";
import { useSocketStore } from "../../context/socket";

interface ActionSettingsProps {
  action: string;
}

export const ActionSettings = ({action}: ActionSettingsProps) => {

  const settingsRef = useRef<{getSettings: () => object}>(null);
  const { socket } = useSocketStore();

  const DisplaySettings = () => {
    switch (action) {
      case "screenshot":
        return <Settings.ScreenshotSettings ref={settingsRef} />;
      case 'scroll':
        return <Settings.ScrollSettings ref={settingsRef}/>;
      case 'scrape':
        return <Settings.ScrapeSettings ref={settingsRef}/>;
      case 'scrapeSchema':
        return <Settings.ScrapeSchemaSettings ref={settingsRef}/>;
      default:
        return null;
    }
  }

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    //get the data from settings
    const settings = settingsRef.current?.getSettings();
    console.log(JSON.stringify(settings));
    //Send notification to the server and generate the pair
    socket?.emit(`action`, {
      action,
      settings
    });
  }

  return (
    <div>
      <ActionDescription>Action settings:</ActionDescription>
      <ActionSettingsWrapper>
        <form onSubmit={handleSubmit}>
          <DisplaySettings/>
          <Button
            variant="outlined"
            type="submit"
            sx={{
              display: "table-cell",
              float: "right",
              marginRight: "15px",
              marginTop: "20px",
            }}
          >
            {"Add Action"}
          </Button>
        </form>
      </ActionSettingsWrapper>
    </div>
  );
};

const ActionSettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;
