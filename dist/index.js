"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlareSolverr = void 0;
const child_process_1 = require("child_process");
const http_proxy_agent_1 = __importDefault(require("http-proxy-agent"));
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const axios_1 = __importDefault(require("axios"));
class FlareSolverr {
    options;
    axios;
    url;
    ready;
    static flareSolverrProcess;
    constructor(options) {
        this.options = options;
        if (options.hostLocally) {
            if (!options.flaresolverrPath)
                throw new Error(`You have not specified a path for an flaresolverr proxy.`);
            this.url = 'http://localhost:8191/v1';
            this.ready = (async () => {
                if (!FlareSolverr.flareSolverrProcess)
                    await FlareSolverr.startFlareSolverrProcess(options.flaresolverrPath);
                return this;
            })();
        }
        else if (options.server) {
            this.ready = (async () => {
                return this;
            })();
            this.url = `http://${options.server.host}:${options.server.port}/v1`;
        }
        else
            throw new Error(`You have not specified a server or set hosting to local.`);
        this.axios = axios_1.default.create({
            proxy: options?.proxy ? false : undefined,
            httpAgent: options?.proxy && new ((0, http_proxy_agent_1.default)({
                host: options.proxy.host,
                port: options.proxy.port
            })),
            httpsAgent: options?.proxy && new ((0, https_proxy_agent_1.default)({
                host: options.proxy.host,
                port: options.proxy.port
            })),
            timeout: options.maxTimeout
        });
    }
    async createSession(request) {
        const CMD = 'sessions.create';
        const request_ = {
            data: {
                ...request?.data,
                cmd: CMD
            }
        };
        try {
            const response = await this.axios.post(this.url, request_.data);
            return response.data;
        }
        catch (error) {
            console.error(error);
            throw new Error('Could retrieve data');
        }
    }
    async listSessions() {
        const CMD = 'sessions.list';
        const request_ = {
            data: {
                cmd: CMD
            }
        };
        try {
            const response = await this.axios.post(this.url, request_.data);
            return response.data;
        }
        catch (error) {
            console.error(error);
            throw new Error('Could retrieve data');
        }
    }
    async destroySession(request) {
        const CMD = 'sessions.destroy';
        const request_ = {
            data: {
                ...request.data,
                cmd: CMD
            }
        };
        try {
            const response = await this.axios.post(this.url, request_.data);
            return response.data;
        }
        catch (error) {
            console.error(error);
            throw new Error('Could retrieve data');
        }
    }
    async getRequest(request) {
        const CMD = 'request.get';
        const request_ = {
            data: {
                ...request.data,
                cmd: CMD,
                maxTimeout: this.options.maxTimeout,
            }
        };
        try {
            const response = await this.axios.post(this.url, request_.data);
            return response.data;
        }
        catch (error) {
            console.error(error);
            throw new Error('Could retrieve data');
        }
    }
    static async startFlareSolverrProcess(path) {
        this.flareSolverrProcess = (0, child_process_1.execFile)(path, [], (error, stdout, stderr) => {
            if (error)
                console.log(error);
            if (stdout)
                console.log(stdout);
            if (stderr)
                console.log(stderr);
        });
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                listener?.destroy();
                reject('FlareSolverr proxy failed to start.');
            }, 10000);
            const listener = this.flareSolverrProcess.stdout?.on('data', (data) => {
                if (!data.includes('Listening on http://0.0.0.0:8191'))
                    return;
                listener?.destroy();
                resolve(true);
            });
        });
    }
}
exports.FlareSolverr = FlareSolverr;
(async () => {
    const flareSolverr = await new FlareSolverr({
        maxTimeout: 60000,
        hostLocally: true,
        flaresolverrPath: './flaresolverr/flaresolverr.exe'
    }).ready;
    await flareSolverr.createSession();
    const data = await flareSolverr.getRequest({ data: { url: 'https://disboard.org' } });
    console.log(data);
})();
//# sourceMappingURL=index.js.map