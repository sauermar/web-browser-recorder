/**
 * API endpoints handling remote browser recording sessions.
 */
import { Router } from 'express';

import {
    createRemoteBrowser,
    destroyRemoteBrowser,
    getActiveBrowserId,
    interpretWholeWorkflow,
    stopRunningInterpretation,
    getActiveBrowserCurrentUrl,
} from '../browser-management/controller'
import { chromium } from "playwright";
import logger from "../logger";

export const router = Router();

/**
 * Logs information about remote browser recording session.
 */
router.all('/', (req, res, next) => {
    logger.log('debug',`The record API was invoked: ${req.url}`)
    next() // pass control to the next handler
})

/**
 * GET endpoint for starting the remote browser recording session.
 * returns session's id
 */
router.get('/start', (req, res) => {
    const id = createRemoteBrowser({
        browser: chromium,
        launchOptions: {
            headless: true,
        }
    });
    return res.send(id);
});

/**
 * POST endpoint for starting the remote browser recording session accepting browser launch options.
 * returns session's id
 */
router.post('/start', (req, res) => {
    const id = createRemoteBrowser({
        browser: chromium,
        launchOptions: req.body,
    });
    return res.send(id);
});

/**
 * GET endpoint for terminating the remote browser recording session.
 * returns whether the termination was successful
 */
router.get('/stop/:browserId', async (req, res) => {
    const success = await destroyRemoteBrowser(req.params.browserId);
    return res.send(success);
});

// development only
//TODO remove this endpoint and reprogram it
router.get('/active', (req, res) => {
    const id = getActiveBrowserId();
    return res.send(id);
});

router.get('/active/url', (req, res) => {
    const id = getActiveBrowserId();
    const url = getActiveBrowserCurrentUrl(id);
    return res.send(url);
});

router.get('/interpret', async (req, res) => {
    try {
        await interpretWholeWorkflow();
        return res.send('interpretation done');
    } catch (e) {
        return res.status(400);
    }
});

router.get('/interpret/stop', async (req, res) => {
    await stopRunningInterpretation();
    return res.send('interpretation stopped');
});
