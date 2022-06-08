import { Request, Response } from 'express';

export class ErrorMessage {
    res: Response<any, Record<string, any>>;
    constructor(res:Response<any, Record<string, any>>) {
        this.res = res
    }
    
    serverError = () => {
        return this.res.status(500).json({ "message": "Server Error" });
    }
}
//export const serverError =res.status(500).json({ "message": "Server Error" });