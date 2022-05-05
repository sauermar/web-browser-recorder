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
  if (activeBrowser && activeBrowser.generator) {
    workflowFile = activeBrowser.generator.getWorkflowFile();
  }
  return res.send(workflowFile);
});

router.delete('/pair/:index', (req, res) => {
  const id = browserPool.getActiveBrowserId();
  const browser = browserPool.getRemoteBrowser(id);
  if (browser && browser.generator) {
    browser.generator?.removePairFromWorkflow(parseInt(req.params.index));
    const workflowFile = browser.generator?.getWorkflowFile();
    return res.send(workflowFile);
  }
  return res.send(null);
});

router.post('/pair/:index', (req, res) => {
  const id = browserPool.getActiveBrowserId();
  const browser = browserPool.getRemoteBrowser(id);
  logger.log('debug', `Adding pair to workflow`);
  if (browser && browser.generator) {
    logger.log('debug', `Adding pair to workflow: ${JSON.stringify(req.body)}`);
    if (req.body.pair) {
      browser.generator?.addPairToWorkflow(parseInt(req.params.index), req.body.pair);
      const workflowFile = browser.generator?.getWorkflowFile();
      return res.send(workflowFile);
    }
  }
  return res.send(null);
});
