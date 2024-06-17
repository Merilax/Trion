import * as express from 'express';
const rootRouter = express.Router();

rootRouter.get('health', (req, res) => {
    res.status(200).send('OK');
});

export default rootRouter;