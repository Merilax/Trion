import * as express from 'express';
const rootRouter = express.Router();

rootRouter.get('/', (req, res) => {
    res.status(200).json({ ok: true, reason: "This is an API server." });
});

rootRouter.get('/health', (req, res) => {
    res.status(200).send('OK');
});

export default rootRouter;