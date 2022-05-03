import { Socket } from "socket.io";
import logger from "../logger";
import { browserPool } from "../server";
import { ScrollSettings } from "../../../src/shared/types";

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

const registerActionHandlers = (socket: Socket) => {
  socket.on("action:scroll", generateScroll);
};

export default registerActionHandlers;
