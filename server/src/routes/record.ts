/**
 * API endpoints handling remote browser recording sessions.
 */
import { Router } from 'express';

import { createRemoteBrowser, destroyRemoteBrowser } from '../browser-management/controller'
import { chromium } from "playwright";
import logger from "../logger";

const router = Router();

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
        launchOptions: { headless: false }
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

export default router;
