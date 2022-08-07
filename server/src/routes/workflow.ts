/**
 * RESTful API endpoints handling currently generated workflow management.
 */

import { Router } from 'express';
import logger from "../logger";
import { browserPool } from "../server";
import { readFile } from "../workflow-management/storage";

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

/**
 * Get endpoint returning the parameter array of the recording associated with the browserId browser instance.
 */
router.get('/params/:browserId', (req, res) => {
  const activeBrowser = browserPool.getRemoteBrowser(req.params.browserId);
  let params = null;
  if (activeBrowser && activeBrowser.generator) {
    params = activeBrowser.generator.getParams();
  }
  return res.send(params);
});

/**
 * DELETE endpoint for deleting a pair from the generated workflow.
 */
router.delete('/pair/:index', (req, res) => {
  const id = browserPool.getActiveBrowserId();
  if (id) {
    const browser = browserPool.getRemoteBrowser(id);
    if (browser) {
      browser.generator?.removePairFromWorkflow(parseInt(req.params.index));
      const workflowFile = browser.generator?.getWorkflowFile();
      return res.send(workflowFile);
    }
  }
  return res.send(null);
});

/**
 * POST endpoint for adding a pair to the generated workflow.
 */
router.post('/pair/:index', (req, res) => {
  const id = browserPool.getActiveBrowserId();
  if (id) {
    const browser = browserPool.getRemoteBrowser(id);
    logger.log('debug', `Adding pair to workflow`);
    if (browser) {
      logger.log('debug', `Adding pair to workflow: ${JSON.stringify(req.body)}`);
      if (req.body.pair) {
        browser.generator?.addPairToWorkflow(parseInt(req.params.index), req.body.pair);
        const workflowFile = browser.generator?.getWorkflowFile();
        return res.send(workflowFile);
      }
    }
  }
  return res.send(null);
});

/**
 * PUT endpoint for updating a pair in the generated workflow.
 */
router.put('/pair/:index', (req, res) => {
  const id = browserPool.getActiveBrowserId();
  if (id) {
    const browser = browserPool.getRemoteBrowser(id);
    logger.log('debug', `Updating pair in workflow`);
    if (browser) {
      logger.log('debug', `New value: ${JSON.stringify(req.body)}`);
      if (req.body.pair) {
        browser.generator?.updatePairInWorkflow(parseInt(req.params.index), req.body.pair);
        const workflowFile = browser.generator?.getWorkflowFile();
        return res.send(workflowFile);
      }
    }
  }
  return res.send(null);
});

/**
 * PUT endpoint for updating the currently generated workflow file from the one in the storage.
 */
router.put('/:browserId/:fileName', async (req, res) => {
  try {
    const browser = browserPool.getRemoteBrowser(req.params.browserId);
    logger.log('debug', `Updating workflow file`);
    if (browser && browser.generator) {
      const recording = await readFile(`./../storage/recordings/${req.params.fileName}.waw.json`)
      const parsedRecording = JSON.parse(recording);
      if (parsedRecording.recording) {
        browser.generator?.updateWorkflowFile(parsedRecording.recording, parsedRecording.recording_meta);
        const workflowFile = browser.generator?.getWorkflowFile();
        return res.send(workflowFile);
      }
    }
    return res.send(null);
  } catch (e) {
    const {message} = e as Error;
    logger.log('info', `Error while reading a recording with name: ${req.params.fileName}.waw.json`);
    return res.send(null);
  }
});
