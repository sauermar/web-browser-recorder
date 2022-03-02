import { Router } from 'express';

import { createRemoteBrowser, destroyRemoteBrowser } from '../browser-management/controller'
import { chromium } from "playwright";

const router = Router();

router.get('/start', (req, res) => {
    const id = createRemoteBrowser({
        browser: chromium,
        launchOptions: { headless: false }
    });
    return res.send(id);
});

router.get('/stop/:browserId', async (req, res) => {
    const success = await destroyRemoteBrowser(req.params.browserId);
    return res.send(success);
});

export default router;
