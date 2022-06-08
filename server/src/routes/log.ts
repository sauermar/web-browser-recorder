import { Router } from 'express';
import fs from 'fs';
import logger from "../logger";
import ErrnoException = NodeJS.ErrnoException;
import { LOGS_PATH } from "../constants/config";

export const router = Router();

router.post('/',(req, res) => {
    console.dir(req.body);
    if (req.body) {
        fs.writeFile(`${LOGS_PATH}/client.log`, req.body, {flag: 'w'}, (err: ErrnoException | null) => {
            if (err) {
                logger.error(err)
            }
            //file written successfully
        })
    }
});
