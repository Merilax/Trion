import "dotenv/config";
import config from "./config.json" assert { type: "json" };

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

// Init Express server
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/views'));

import { router } from './routes/chat.js';
app.use('/', router);
app.use('/static', express.static('public'));

//app.listen(PORT, console.log("Server listening on port " + PORT));

const server = https.createServer(options, app);
server.listen(PORT, console.log("Server listening on port " + PORT));

// Init websocket server
const wss = new WebSocketServer({ server: server });

wss.on('listening', () => {
    console.log("WebSocketServer listening on port " + wss.address().address + wss.address().port);
});

import { Message } from "./models/SQL.js";

wss.on('connection', (ws, req) => {
    console.log('New client connected.');

    ws.on('close', () => console.log('Client disconnected.'));

    ws.on('message', async data => {
        try {
            let json = JSON.parse(data);

            switch (json.method) {
                case "sendMessage":
                    let message;
                    await Message.create({ userId: json.userId, content: json.messageContent, sentAt: json.timestamp }).then(res => {
                        message = res;
                    }).catch(err => console.log(err));

                    if (message) {
                        wss.clients.forEach(client => {
                            client.send(JSON.stringify({ ok: true, method: "sendMessage", data: message }));
                        });
                    } else {
                        ws.send(JSON.stringify({ ok: false, reason: "Message could not be saved." }));
                    }

                    break;

                case "getMessageHistory":
                    let messages = await Message.findAll({ limit: 100, order: [['sentAt', 'ASC']] });

                    ws.send(JSON.stringify({ ok: true, method: json.method, data: messages }));
                    break;

                default:
                    ws.send(JSON.stringify({ ok: false, reason: "Bad method." }));
                    break;
            }
        } catch (error) {

        }

    });
    ws.on('error', err => console.log('Websocket error: ' + err));
});