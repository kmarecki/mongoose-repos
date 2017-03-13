import { MongoDb } from './db';

export function defaultHandler(err: any, callback: (err: any) => any): void {
    if (err) {
        MongoDb.log(err);
    }
    callback(err);
}

export function defaultResultHandler(err: any, result: any, callback: (err: any, result: any) => any): void {
    if (err == null && result != null) {
        callback(null, result);
    } else {
        if (err) {
            MongoDb.log(err);
        }
        callback(err, result);
    }
}


export function defaultResultArrayHandler(err: any, result: any[], callback: (err: any, result: any[]) => any, projection?: (item: any) => any): void {
    let list = projection ? Array<Object>() : result;

    if (err == null && result != null) {
        if (projection) {
            result.forEach(item => {
                let resultitem = projection(item);
                list.push(resultitem);
            });
        }
        callback(null, list);
    } else {
        if (err) {
            MongoDb.log(err);
        }
        callback(err, null);
    }
}
