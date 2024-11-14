type ResType = {
    code: number;
    data?: any;
    message?: string;
}

export const DataResponse = (code: number, data?: any, message?: string) => {
    const res: ResType = {
        code: code,
        data: data,
        message: message
    }
    return res;
}
