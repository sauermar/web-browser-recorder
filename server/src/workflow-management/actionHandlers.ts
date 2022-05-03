import { Socket } from "socket.io";
import logger from "../logger";
import { browserPool } from "../server";
import { ScreenshotSettings, ScrollSettings } from "../../../src/shared/types";

const generateScroll = async (settings: ScrollSettings) => {
  logger.log('debug', 'Generating scroll action emitted from client');
  const id = browserPool.getActiveBrowserId();
  const activeBrowser = browserPool.getRemoteBrowser(id);
  if (activeBrowser && activeBrowser.generator) {
    await activeBrowser.generator.scroll(settings);
  } else {
    logger.log('warn', `Did not generate scroll, because there is no active browser`);
  }
}

const generateScreenshot = async (settings: ScreenshotSettings) => {
  logger.log('debug', 'Generating screenshot action emitted from client');
  const id = browserPool.getActiveBrowserId();
  const activeBrowser = browserPool.getRemoteBrowser(id);
  if (activeBrowser && activeBrowser.generator) {
    await activeBrowser.generator.screenshot(settings);
  } else {
    logger.log('warn', `Did not generate screenshot, because there is no active browser`);
  }
}

const registerActionHandlers = (socket: Socket) => {
  socket.on("action:scroll", generateScroll);
  socket.on("action:screenshot", generateScreenshot);
};

export default registerActionHandlers;
