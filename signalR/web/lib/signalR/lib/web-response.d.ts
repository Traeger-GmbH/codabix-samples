export declare enum WebResponseStatus {
    success = "success",
    error = "error",
    partialSuccess = "partialSuccess"
}
export interface IWebResult {
    status: number;
}
export interface IWebError {
    status: number;
    title: string;
    detail: string;
    parameters?: any;
    errors?: Array<IWebError>;
}
export interface IWebResponse {
    status: WebResponseStatus;
    error?: IWebError;
    result: IWebResult;
}
