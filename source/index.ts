import { ChildProcess, execFile } from 'child_process'
import HttpProxyAgent from 'http-proxy-agent'
import HttpsProxyAgent from 'https-proxy-agent'
import Axios, { AxiosInstance } from 'axios'

export interface RequestStandardData {
    cmd: string,
    url?: string,
    maxTimeout?: number
}

export interface GetRequestRequestData {
    session?: number,
    proxy?: {
        url: string
    },
    url: string,
    cookies?: [Cookie],
    returnOnlyCookies?: boolean
}

export interface GetRequestRequest {
    data: GetRequestRequestData
}

export interface GetRequestResponseData extends ResponseStandardData {
    solution: Solution
}

export interface GetRequestResponse {
    data: GetRequestResponseData
}

export interface ResponseStandardData {
    status: string,
    message: string,
    startTimestamp: number,
    endTimestamp: number,
    version: string,
}

export interface CreateSessionRequestData {
    session?: number,
    proxy?: {
        url: string
    }
}

export interface CreateSessionRequest {
    data: CreateSessionRequestData
}

export interface DestroySessionRequestData {
    session: string
}

export interface DestroySessionRequest {
    data: DestroySessionRequestData
}

export interface Cookie {
    name: string,
    value: string,
    domain: string,
    path: string,
    expires: number,
    size: string,
    httpOnly: boolean,
    secure: boolean,
    session: boolean,
    sameSite: string
}

export interface Solution {
    url: string,
    status: number,
    headers: any,
    response: any,
    cookies: [Cookie],
    userAgent: string
}

export interface CreateSessionResponseData extends ResponseStandardData {
    session: string
}

export interface CreateSessionResponse {
    data: CreateSessionResponseData
}

export interface ListSessionsResponseData extends ResponseStandardData {
    sessions: [string]
}

export interface ListSessionsResponse {
    data: ListSessionsResponseData
}

export interface DestroySessionResponseData extends ResponseStandardData {

}

export interface DestroySessionResponse {
    data: DestroySessionResponseData
}

export interface Proxy {
    host: string,
    port: number,
    protocol: string
}

export interface FlareSolverrOptions {
    proxy?: Proxy,
    maxTimeout: number,
    server?: {
        host: string,
        port: number
    }
    hostLocally?: boolean,
    flaresolverrPath?: string
}

export class FlareSolverr {
    private options: FlareSolverrOptions
    private axios: AxiosInstance
    private url: string
    readonly ready: Promise<FlareSolverr>
    private static flareSolverrProcess: ChildProcess

    constructor(options: FlareSolverrOptions) {
        this.options = options

        if (options.hostLocally) {
            if (!options.flaresolverrPath)
                throw new Error(`You have not specified a path for an flaresolverr proxy.`)
            this.url = 'http://localhost:8191/v1'
            this.ready = (async () => {
                if (!FlareSolverr.flareSolverrProcess)
                    await FlareSolverr.startFlareSolverrProcess(options.flaresolverrPath!)
                return this
            })()
        }
        else if (options.server) {
            this.ready = (async () => {
                return this
            })()
            this.url = `http://${options.server.host}:${options.server.port}/v1`
        }
        else
            throw new Error(`You have not specified a server or set hosting to local.`)

        this.axios = Axios.create({
            proxy: options?.proxy ? false : undefined,
            httpAgent: options?.proxy && new (HttpProxyAgent({
                host: options.proxy.host,
                port: options.proxy.port
            }) as any),
            httpsAgent: options?.proxy && new (HttpsProxyAgent({
                host: options.proxy.host,
                port: options.proxy.port
            }) as any),
            timeout: options.maxTimeout
        })
    }

    public async createSession(request?: CreateSessionRequest) {
        const CMD = 'sessions.create'
        const request_: CreateSessionRequest & { data: RequestStandardData } = {
            data: {
                ...request?.data,
                cmd: CMD
            }
        }
        try {
            const response: CreateSessionResponse = await this.axios.post(this.url, request_.data)
            return response.data
        } catch (error) {
            console.error(error)
            throw new Error('Could retrieve data')
        }
    }

    public async listSessions() {
        const CMD = 'sessions.list'
        const request_: { data: RequestStandardData } = {
            data: {
                cmd: CMD
            }
        }
        try {
            const response: ListSessionsResponse = await this.axios.post(this.url, request_.data)
            return response.data
        } catch (error) {
            console.error(error)
            throw new Error('Could retrieve data')
        }
    }

    public async destroySession(request: DestroySessionRequest) {
        const CMD = 'sessions.destroy'
        const request_: DestroySessionRequest & { data: RequestStandardData } = {
            data: {
                ...request.data,
                cmd: CMD
            }
        }
        try {
            const response: ListSessionsResponse = await this.axios.post(this.url, request_.data)
            return response.data
        } catch (error) {
            console.error(error)
            throw new Error('Could retrieve data')
        }
    }

    public async getRequest(request: GetRequestRequest) {
        const CMD = 'request.get'
        const request_: GetRequestRequest & { data: RequestStandardData } = {
            data: {
                ...request.data,
                cmd: CMD,
                maxTimeout: this.options.maxTimeout,
            }
        }
        try {
            const response: ListSessionsResponse = await this.axios.post(this.url, request_.data)
            return response.data
        } catch (error) {
            console.error(error)
            throw new Error('Could retrieve data')
        }
    }

    private static async startFlareSolverrProcess(path: string) {
        this.flareSolverrProcess = execFile(path, [], (error, stdout, stderr) => {
            if (error)
                console.log(error)
            if (stdout)
                console.log(stdout)
            if (stderr)
                console.log(stderr)
        })

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                listener?.destroy()
                reject('FlareSolverr proxy failed to start.')
            }, 10000)
            const listener = this.flareSolverrProcess.stdout?.on('data', (data: string) => {
                if (!data.includes('Listening on http://0.0.0.0:8191'))
                    return
                listener?.destroy()
                resolve(true)
            })
        })
    }
}