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

app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'trion.auth',
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    resave: true,
    saveUninitialized: true
}));

const server = https.createServer(options, app);
server.listen(PORT, console.log("Server listening on port " + PORT));

import cors from 'cors';
import { register, login } from './routes/auth.js';
import { getMessageHistory } from './routes/message.js';
import { createGroup, deleteGroup } from "./routes/group.js";
import { createChannel, deleteChannel } from "./routes/channel.js";

app.use(cors());
app.use('/auth/register', register);
app.use('/auth/login', login);
app.use('/message/history', getMessageHistory);
app.use('/group/create', createGroup);
app.use('/group/delete', deleteGroup);
app.use('/channel/create', createChannel);
app.use('/channel/delete', deleteChannel);

// === WEBSOCKET SERVER ===

const wss = new WebSocketServer({ server: server });

wss.on('listening', () => {
    console.log("WebSocketServer listening on port " + wss.address().address + wss.address().port);
});

import { Message } from "./models/Message.js";

wss.on('connection', (ws, req) => {
    console.log('New client connected.');

    ws.on('close', () => console.log('Client disconnected.'));

    ws.on('message', async data => {
        try {
            let json = JSON.parse(data);

            await Message.create({ userId: json.userId, channelId: json.channelId, content: json.content, sentAt: json.sentAt }).then(message => {
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({ ok: true, data: message }));
                });
            }).catch(err => {
                console.log(err);
                ws.send(JSON.stringify({ ok: false, reason: "Message could not be saved." }));
            });
        } catch (error) { }
    });
    ws.on('error', err => console.log('Websocket error: ' + err));
});