/**
 * API endpoints handling workflow management.
 */

import { Router } from 'express';
import logger from "../logger";
import { browserPool } from "../server";

export const router = Router();

/**
 * Logs information about workflow API.
 */
router.all('/', (req, res, next) => {
  logger.log('debug',`The workflow API was invoked: ${req.url}`)
  next() // pass control to the next handler
})

/**
 * GET endpoint for a recording linked to a remote browser instance.
 * returns session's id
 */
router.get('/:browserId', (req, res) => {
  const activeBrowser = browserPool.getRemoteBrowser(req.params.browserId);
  let workflowFile = null;
  if (activeBrowser) {
    workflowFile = activeBrowser.generator.getWorkflowFile();
  }
  return res.send(workflowFile);
});
