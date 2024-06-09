import "dotenv/config";
//import config from "./config.json" assert { type: "json" };

import path from "path";
import express from 'express';
import { WebSocketServer } from 'ws';
import https from 'https';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4111;
const options = {
    key: fs.readFileSync("./certs/server.key"),
    cert: fs.readFileSync("./certs/server.crt")
};

// === EXPRESS SERVER ===

import session from 'express-session';
const app = express();
/*
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'trion.auth',
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    resave: true,
    saveUninitialized: true
}));*/

const server = https.createServer(options, app);
server.listen(PORT, console.log("Server listening on port " + PORT));

import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import channelRouter from "./routes/channel.js";
import groupRouter from "./routes/group.js";
import messageRouter from './routes/message.js';
import userRouter from './routes/user.js';

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/channel', channelRouter);
app.use('/group', groupRouter);
app.use('/message', messageRouter);
app.use('/user', userRouter);

// === WEBSOCKET SERVER ===

const wss = new WebSocketServer({ server: server });

wss.on('listening', () => {
    console.log("WebSocketServer listening on port " + wss.address().address + wss.address().port);
});

import { Message } from "./models/Message.js";

wss.on('connection', (ws, req) => {
    //console.log('New client connected.');

    //ws.on('close', () => console.log('Client disconnected.'));

    ws.on('message', async data => {
        try {
            let json = JSON.parse(data);

            const { sub, exp } = jwt.verify(json.token, process.env.JWT_SECRET);
            if (exp < Date.now() / 1000);
            if (parseInt(sub) != parseInt(json.userId)) return;

            const message = await Message.create({ userId: parseInt(json.userId), channelId: parseInt(json.channelId), content: json.content, sentAt: parseInt(json.sentAt) })
            //.catch(err => console.log(err));

            wss.clients.forEach(client => {
                client.send(JSON.stringify(message));
            });
        } catch (error) { }
    });
    ws.on('error', err => console.log('Websocket error: ' + err));
});

// === PROCESS EXIT CLEANUP ===

import { sequelize } from "./models/SQL.js";

let events = [
    { name: 'beforeExit', exitCode: 0 },
    { name: 'uncaughtExecption', exitCode: 1 },
    { name: 'SIGINT', exitCode: 130 },
    { name: 'SIGTERM', exitCode: 143 }
];

events.forEach((e) => {
    process.on(e.name, () => {
        sequelize.connectionManager.close()
            .then(() => {
                console.log('Sequelize connection pool cleared.');
                process.exit(e.exitCode);
            })
            .catch((err) => {
                console.error(err);
                process.exit(1);
            });
    });
});