import 'dotenv/config'
//import config from "./config.json" assert { type: "json" };

import path from "path";
import express from 'express';
import { WebSocketServer } from 'ws';
import https from 'https';
import http from 'http';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4111;
const options = {};
if (process.env.DEVMODE == "true") {
    options.key = fs.readFileSync("./certs/server.key");
    options.cert = fs.readFileSync("./certs/server.crt");
}

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
let server;
if (process.env.DEVMODE == "true")
    server = https.createServer(options, app);
else
    server = http.createServer(app);
server.listen(PORT, console.log("Server listening on port " + PORT));

import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import channelRouter from "./routes/channel.js";
import groupRouter from "./routes/group.js";
import messageRouter from './routes/message.js';
import userRouter from './routes/user.js';
import rootRouter from "./routes/root.js";

app.use(cors({ credentials: true, origin: true, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(cookieParser());
app.use('/', rootRouter);
app.use('/auth', authRouter);
app.use('/channel', channelRouter);
app.use('/group', groupRouter);
app.use('/message', messageRouter);
app.use('/user', userRouter);

// === WEBSOCKET SERVER ===

const wss = new WebSocketServer({ server: server });
// 
wss.on('listening', () => {
    console.log("WebSocketServer listening on port " + wss.address().address + wss.address().port);
});

import jwt from "jsonwebtoken";
import { User } from "./models/User.js";
import { Message } from "./models/Message.js";
import { sequelize } from "./models/SQL.js";

wss.on('connection', (ws, req) => {
    ws.on('message', async data => {
        try {
            let json = JSON.parse(data);

            const { sub, exp } = jwt.verify(json.token, process.env.JWT_SECRET);
            if (exp < Date.now() / 1000);
            if (parseInt(sub) != parseInt(json.userId)) return;

            if (!json.channelId && !json.directChannelId) return;

            if (json.content.length > 200) return;

            let message = await Message.create({
                userId: parseInt(json.userId),
                channelId: json.channelId ? parseInt(json.channelId) : null,
                directChannelId: json.directChannelId ? parseInt(json.directChannelId) : null,
                content: json.content,
                sentAt: parseInt(json.sentAt)
            });
            message = await Message.findOne({ where: { id: message.id }, include: User });

            wss.clients.forEach(client => {
                client.send(JSON.stringify(message));
            });
        } catch (error) { console.log(error); }
    });
    ws.on('error', err => console.log('Websocket error: ' + err));
});

// === PROCESS EXIT CLEANUP ===

let events = [
    { name: 'beforeExit', exitCode: 0 },
    //    { name: 'uncaughtException', exitCode: 1 },
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