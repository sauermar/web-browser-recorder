import { Router } from 'express';

import { createRemoteBrowser, destroyRemoteBrowser } from '../browser-management/controller'
import { chromium } from "playwright";
import logger from "../logger";

const router = Router();

router.all('/', (req, res, next) => {
    logger.log('debug',`The record API was invoked: ${req.url}`)
    next() // pass control to the next handler
})

router.get('/start', (req, res) => {
    const id = createRemoteBrowser({
        browser: chromium,
        launchOptions: { headless: false }
    });
    return res.send(id);
});

router.post('/start', (req, res) => {
    const id = createRemoteBrowser({
        browser: chromium,
        launchOptions: req.body,
    });
    return res.send(id);
});

router.get('/stop/:browserId', async (req, res) => {
    const success = await destroyRemoteBrowser(req.params.browserId);
    return res.send(success);
});

export default router;
