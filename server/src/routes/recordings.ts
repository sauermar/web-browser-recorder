/**
 * API endpoints handling workflow management.
 */

import { Router } from 'express';
import logger from "../logger";
import { deleteFile, readFile, readFiles } from "../workflow-management/storage";

export const router = Router();

/**
 * Logs information about recordings API.
 */
router.all('/', (req, res, next) => {
  logger.log('debug',`The recordings API was invoked: ${req.url}`)
  next() // pass control to the next handler
})

router.get('/', async (req, res) => {
  try {
    const data = await readFiles('./../recordings/');
    return res.send(data);
  } catch (e) {
    logger.log('info', 'Error while reading recordings');
    return res.send(null);
  }
});

router.delete('/:fileName', async (req, res) => {
  try {
    await deleteFile(`./../recordings/${req.params.fileName}.waw.json`);
    return res.send(true);
  } catch (e) {
    const {message} = e as Error;
    console.log(message)
    logger.log('info', `Error while deleting a recording with name: ${req.params.fileName}.waw.json`);
    return res.send(false);
  }
});
