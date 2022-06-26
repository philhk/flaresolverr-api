export interface RequestStandardData {
    cmd: string;
    url?: string;
    maxTimeout?: number;
}
export interface GetRequestRequestData {
    session?: number;
    proxy?: {
        url: string;
    };
    url: string;
    cookies?: [Cookie];
    returnOnlyCookies?: boolean;
}
export interface GetRequestRequest {
    data: GetRequestRequestData;
}
export interface GetRequestResponseData extends ResponseStandardData {
    solution: Solution;
}
export interface GetRequestResponse {
    data: GetRequestResponseData;
}
export interface ResponseStandardData {
    status: string;
    message: string;
    startTimestamp: number;
    endTimestamp: number;
    version: string;
}
export interface CreateSessionRequestData {
    session?: number;
    proxy?: {
        url: string;
    };
}
export interface CreateSessionRequest {
    data: CreateSessionRequestData;
}
export interface DestroySessionRequestData {
    session: string;
}
export interface DestroySessionRequest {
    data: DestroySessionRequestData;
}
export interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    size: string;
    httpOnly: boolean;
    secure: boolean;
    session: boolean;
    sameSite: string;
}
export interface Solution {
    url: string;
    status: number;
    headers: any;
    response: any;
    cookies: [Cookie];
    userAgent: string;
}
export interface CreateSessionResponseData extends ResponseStandardData {
    session: string;
}
export interface CreateSessionResponse {
    data: CreateSessionResponseData;
}
export interface ListSessionsResponseData extends ResponseStandardData {
    sessions: [string];
}
export interface ListSessionsResponse {
    data: ListSessionsResponseData;
}
export interface DestroySessionResponseData extends ResponseStandardData {
}
export interface DestroySessionResponse {
    data: DestroySessionResponseData;
}
export interface Proxy {
    host: string;
    port: number;
    protocol: string;
}
export interface FlareSolverrOptions {
    proxy?: Proxy;
    maxTimeout: number;
    server?: {
        host: string;
        port: number;
    };
    hostLocally?: boolean;
    flaresolverrPath?: string;
}
export declare class FlareSolverr {
    private options;
    private axios;
    private url;
    readonly ready: Promise<FlareSolverr>;
    private static flareSolverrProcess;
    constructor(options: FlareSolverrOptions);
    createSession(request?: CreateSessionRequest): Promise<CreateSessionResponseData>;
    listSessions(): Promise<ListSessionsResponseData>;
    destroySession(request: DestroySessionRequest): Promise<ListSessionsResponseData>;
    getRequest(request: GetRequestRequest): Promise<ListSessionsResponseData>;
    private static startFlareSolverrProcess;
}
