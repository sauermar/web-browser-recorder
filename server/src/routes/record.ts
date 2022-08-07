/**
 * RESTful API endpoints handling remote browser recording sessions.
 */
import { Router } from 'express';

import {
    initializeRemoteBrowserForRecording,
    destroyRemoteBrowser,
    getActiveBrowserId,
    interpretWholeWorkflow,
    stopRunningInterpretation,
    getRemoteBrowserCurrentUrl, getRemoteBrowserCurrentTabs,
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
    const id = initializeRemoteBrowserForRecording({
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
    const id = initializeRemoteBrowserForRecording({
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

/**
 * GET endpoint for getting the id of the active remote browser.
 */
router.get('/active', (req, res) => {
    const id = getActiveBrowserId();
    return res.send(id);
});

/**
 * GET endpoint for getting the current url of the active remote browser.
 */
router.get('/active/url', (req, res) => {
    const id = getActiveBrowserId();
    if (id) {
        const url = getRemoteBrowserCurrentUrl(id);
        return res.send(url);
    }
    return res.send(null);
});

/**
 * GET endpoint for getting the current tabs of the active remote browser.
 */
router.get('/active/tabs', (req, res) => {
    const id = getActiveBrowserId();
    if (id) {
        const hosts = getRemoteBrowserCurrentTabs(id);
        return res.send(hosts);
    }
    return res.send([]);
});

/**
 * GET endpoint for starting an interpretation of the currently generated workflow.
 */
router.get('/interpret', async (req, res) => {
    try {
        await interpretWholeWorkflow();
        return res.send('interpretation done');
    } catch (e) {
        return res.send('interpretation done');
        return res.status(400);
    }
});

/**
 * GET endpoint for stopping an ongoing interpretation of the currently generated workflow.
 */
router.get('/interpret/stop', async (req, res) => {
    await stopRunningInterpretation();
    return res.send('interpretation stopped');
});
