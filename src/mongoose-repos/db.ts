import * as mongoose from 'mongoose';

import { MongoConfiguration } from './configuration';

export class MongoDb {

    private static logger: (message: string) => any = (msg) => console.log(msg);

    static log(message: string): void {
        if (MongoConfiguration.useLogger) {
            if (MongoDb.logger) {
                MongoDb.logger(message);
            }
        }
    }

    static dropDatabase(call: (err, result) => any): void {
        let uri = MongoConfiguration.uri;
        mongoose.connect(uri).then(
        () => {
            mongoose.connection.db.dropDatabase();
            call(undefined, undefined);
        });
    }

    static configure() : void {
        (<any>mongoose).Promise = global.Promise;
    }

    static open(): Promise<{}> {
        mongoose.set('debug', MongoConfiguration.debug);
        if (mongoose.connection.readyState === 0) {

            mongoose.connection.on('disconnected', () => {
                MongoDb.log('Mongoose default connection disconnected');
            });
            process.on('SIGINT', function () {
                mongoose.connection.close(() => {
                    MongoDb.log('Mongoose default connection disconnected through app termination.');
                    process.exit(0);
                });
            });
            return new Promise((resolve, reject) => {
                mongoose.connect(MongoConfiguration.uri)
                    .then(() => {
                        MongoDb.log(`Mongoose default connection open to : ${MongoConfiguration.uri}`);
                        resolve();
                    })
                    .catch(err => {
                        MongoDb.log(`Mongoose default connection error: ${err}`);
                        reject(err);
                    });
            });
        }

        return new Promise((resolve, reject) => resolve());
    }
}
