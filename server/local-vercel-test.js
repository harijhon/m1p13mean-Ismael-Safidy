import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import app from './app.js';

const server = express();

server.use('/api', (req, res, next) => {
    app(req, res, next);
});

const clientDist = path.join(__dirname, '..', 'client', 'dist', 'sakai-ng', 'browser');

server.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API Route Not Found' });
    }
    if (req.path.match(/(.*\.[^/]+)$/)) {
        const filePath = path.join(clientDist, req.path);
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }
    res.sendFile(path.join(clientDist, 'index.html'));
});
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Local Vercel simulator running on http://localhost:${PORT}`);
});
