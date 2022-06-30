/**
 * API endpoints handling workflow management.
 */

import { Router } from 'express';
import logger from "../logger";
import { deleteFile, readFile, readFiles, saveFile } from "../workflow-management/storage";
import { createRemoteBrowserForRun, destroyRemoteBrowser } from "../browser-management/controller";
import { chromium } from "playwright";
import { browserPool } from "../server";
import fs from "fs";

export const router = Router();

/**
 * Logs information about recordings API.
 */
router.all('/', (req, res, next) => {
  logger.log('debug',`The recordings API was invoked: ${req.url}`)
  next() // pass control to the next handler
})

router.get('/recordings', async (req, res) => {
  try {
    const data = await readFiles('./../storage/recordings/');
    return res.send(data);
  } catch (e) {
    logger.log('info', 'Error while reading recordings');
    return res.send(null);
  }
});

router.delete('/recordings/:fileName', async (req, res) => {
  try {
    await deleteFile(`./../storage/recordings/${req.params.fileName}.waw.json`);
    return res.send(true);
  } catch (e) {
    const {message} = e as Error;
    console.log(message)
    logger.log('info', `Error while deleting a recording with name: ${req.params.fileName}.waw.json`);
    return res.send(false);
  }
});

router.get('/runs', async (req, res) => {
  try {
    const data = await readFiles('./../storage/runs/');
    return res.send(data);
  } catch (e) {
    logger.log('info', 'Error while reading runs');
    return res.send(null);
  }
});

router.delete('/runs/:fileName', async (req, res) => {
  try {
    await deleteFile(`./../storage/runs/${req.params.fileName}.json`);
    return res.send(true);
  } catch (e) {
    const {message} = e as Error;
    console.log(message)
    logger.log('info', `Error while deleting a run with name: ${req.params.fileName}.json`);
    return res.send(false);
  }
});

router.put('/runs/:fileName', async (req, res) => {
  try {
    const id = await createRemoteBrowserForRun({
      browser: chromium,
      launchOptions: { headless: false }
    });

    const run_meta = {
      status: 'RUNNING',
      name: req.params.fileName,
      startedAt: new Date().toLocaleString(),
      finishedAt: '',
      duration: '',
      task: req.body.params ? 'task-1' : '',
      browserId: id,
      interpreterSettings: req.body,
    };
    fs.mkdirSync('../storage/runs', { recursive: true })
    await saveFile(
      `../storage/runs/${req.params.fileName}.json`,
      JSON.stringify({ ...run_meta, log: '' }, null, 2)
    );
    return res.send(id);
  } catch (e) {
    const {message} = e as Error;
    console.log(message)
    logger.log('info', `Error while creating a run with name: ${req.params.fileName}.json`);
    return res.send('');
  }
});

router.get('/runs/run/:fileName', async (req, res) => {
  try {
    // read the recording from storage
    const recording = await readFile(`./../storage/recordings/${req.params.fileName}.waw.json`)
    const parsedRecording = JSON.parse(recording);
    // read the run from storage
    const run = await readFile(`./../storage/runs/${req.params.fileName}.json`)
    const parsedRun = JSON.parse(run);

    // interpret the run in active browser
    const browser = browserPool.getRemoteBrowser(parsedRun.browserId);
    const currentPage = browser?.getCurrentPage();
    if (browser && currentPage) {
      const interpretationInfo = await browser.interpreter.InterpretRecording(
        parsedRecording.recording, currentPage, parsedRun.interpreterSettings);
      const duration = Math.round((new Date().getTime() - new Date(parsedRun.startedAt).getTime()) / 1000);
      const durString = (() => {
        if (duration < 60) {
          return `${duration} s`;
        }
        else {
          const minAndS = (duration / 60).toString().split('.');
          return `${minAndS[0]} m ${minAndS[1]} s`;
        }
      })();
      const success = await destroyRemoteBrowser(parsedRun.browserId);
      if (success) {
        const run_meta = {
          status: interpretationInfo.result,
          name: parsedRun.name,
          startedAt: parsedRun.startedAt,
          finishedAt: new Date().toLocaleString(),
          duration: durString,
          task: parsedRun.task,
          browserId: null,
          interpreterSettings: parsedRun.interpreterSettings,
        };
        fs.mkdirSync('../storage/runs', { recursive: true })
        await saveFile(
          `../storage/runs/${parsedRun.name}.json`,
          JSON.stringify({ ...run_meta, log: interpretationInfo.log.join('\n') }, null, 2)
        );
        return res.send(true);
      } else {
        throw new Error('Could not destroy browser');
      }
    } else {
       throw new Error('Browser not initialized properly');
    }
    return res.send();
  } catch (e) {
    const {message} = e as Error;
    console.log(message)
    logger.log('info', `Error while running a recording with name: ${req.params.fileName}.json`);
    return res.send(false);
  }
});


router.post('/runs/abort/:fileName', async (req, res) => {
  try {
    // read the run from storage
    const run = await readFile(`./../storage/runs/${req.params.fileName}.json`)
    const parsedRun = JSON.parse(run);

    //get current log
    const browser = browserPool.getRemoteBrowser(parsedRun.browserId);
    const currentLog = browser?.interpreter.debugMessages.join('/n');
    const run_meta = {
      status: 'ABORTED',
      name: parsedRun.name,
      startedAt: parsedRun.startedAt,
      finishedAt: new Date().toLocaleString(),
      duration: '',
      task: parsedRun.task,
      browserId: null,
      interpreterSettings: parsedRun.interpreterSettings,
    };
    const duration = Math.round((new Date(run_meta.finishedAt).getTime() - new Date(parsedRun.startedAt).getTime()) / 1000);
    const durString = (() => {
      if (duration < 60) {
        return `${duration} s`;
      }
      else {
        const minAndS = (duration / 60).toString().split('.');
        return `${minAndS[0]} m ${minAndS[1]} s`;
      }
    })();
    run_meta.duration = durString;

    fs.mkdirSync('../storage/runs', { recursive: true })
    await saveFile(
      `../storage/runs/${parsedRun.name}.json`,
      JSON.stringify({ ...run_meta, log: currentLog }, null, 2)
    );
    return res.send(true);
  } catch (e) {
    const {message} = e as Error;
    console.log(message)
    logger.log('info', `Error while running a recording with name: ${req.params.fileName}.json`);
    return res.send(false);
  }
});
