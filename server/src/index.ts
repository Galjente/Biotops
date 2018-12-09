import * as http from "http";

import * as winston from "winston";
import {App} from "./app";

const DEFAULT_HTTP_PORT: number = 3000;
const httpPort: number = normalizePort(process.env.HTTP_PORT, DEFAULT_HTTP_PORT);
const app:App = new App();
const environment: string = app.express.get('env');

winston.info('Biotops web server');
winston.debug(`Environment: ${environment}`);

app.express.set('port', httpPort);

const httpServer: http.Server = http.createServer(app.express);

httpServer.listen(httpPort);
httpServer.on('error', onError);
httpServer.on('listening', onHttpListening);

function normalizePort(val: number|string, defaultPort: number): number {
    let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    return (!port || isNaN(port) || port <= 0) ? defaultPort : port;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind:string = (typeof httpPort === 'string')
        ? 'Pipe ' + httpPort
        : 'Port ' + httpPort;

    switch(error.code) {
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
function onHttpListening(): void {
    let address = httpServer.address();
    let bind:string = (typeof address === 'string')
        ? `pipe ${address}`
        : `port ${address.port}`;
    winston.info(`HTTP listening on ${bind}`);
}
