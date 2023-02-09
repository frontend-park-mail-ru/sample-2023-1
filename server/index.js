const http = require('http');
const fs = require('fs');
const debug = require('debug');

const log = debug('server');

const SERVER_PORT = 8002;

const page404 = fs.readFileSync('public/404.html');

const server = http.createServer((request, response) => {
    log('REQUEST', request.method, request.url);
    const {url} = request;
    const normalizedUrl = url === '/' ? '/index.html' : url;

    log('normalized url ::', normalizedUrl);
    const filepath = `./public${normalizedUrl}`;
    log('filepath ::', filepath);
    fs.readFile(filepath, (err, data) => {
        if (err) {
            response.write(page404);
            response.end();
            log('error ::', err);
            return;
        }

        log('success');
        response.write(data);
        response.end();
    })
});

log('Starting server...');
server.listen(SERVER_PORT);
