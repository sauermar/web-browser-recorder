import { Router } from 'express';

import { createRemoteBrowser } from '../browser-management/controller'

const router = Router();

router.get('/', (req, res) => {
    createRemoteBrowser();
    return res.send('Get id of a created remote browser.');
});

export default router;
