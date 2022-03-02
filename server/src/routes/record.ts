import { Router } from 'express';

import {createRemoteBrowser, destroyRemoteBrowser} from '../browser-management/controller'

const router = Router();

router.get('/start', (req, res) => {
    const id = createRemoteBrowser();
    return res.send(id);
});

router.get('/stop/:browserId', async (req, res) => {
    const success = await destroyRemoteBrowser(req.params.browserId);
    return res.send(success);
});

export default router;
