"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const winston = require("winston");
const app_1 = require("./app");
const DEFAULT_HTTP_PORT = 3000;
const httpPort = normalizePort(process.env.HTTP_PORT, DEFAULT_HTTP_PORT);
const app = new app_1.App();
const environment = app.express.get('env');
winston.info('Biotops web server');
winston.debug(`Environment: ${environment}`);
app.express.set('port', httpPort);
const httpServer = http.createServer(app.express);
httpServer.listen(httpPort);
httpServer.on('error', onError);
httpServer.on('listening', onHttpListening);
function normalizePort(val, defaultPort) {
    let port = (typeof val === 'string') ? parseInt(val, 10) : val;
    return (!port || isNaN(port) || port <= 0) ? defaultPort : port;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let bind = (typeof httpPort === 'string')
        ? 'Pipe ' + httpPort
        : 'Port ' + httpPort;
    switch (error.code) {
        case 'EACCES':
            winston.error(`HTTP ${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            winston.error(`HTTP ${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onHttpListening() {
    let address = httpServer.address();
    let bind = (typeof address === 'string')
        ? `pipe ${address}`
        : `port ${address.port}`;
    winston.info(`HTTP listening on ${bind}`);
}
//# sourceMappingURL=index.js.map