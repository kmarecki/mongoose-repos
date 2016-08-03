import * as mongoose from 'mongoose';
import * as autoIncrement from 'mongoose-auto-increment';

import {MongoConfiguration} from './configuration';

export class MongoDb {
    static dropDatabase(call: (err, result) => any): void {
        let uri = MongoConfiguration.uri;
        let conn = mongoose.connect(uri);
        conn.connection.db.dropDatabase();
        call(undefined, undefined);
    }

    static open(): void {
        mongoose.set('debug', MongoConfiguration.debug);
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(MongoConfiguration.uri);

            if (MongoConfiguration.useAutoIncrement) {
                autoIncrement.initialize(mongoose.connection);
            }

            mongoose.connection.on('connected', () => {
                console.log('Mongoose default connection open to ' + MongoConfiguration.uri);
            });
            mongoose.connection.on('error', (err) => {
                console.log('Mongoose default connection error: ' + err);
            });
            mongoose.connection.on('disconnected', function () {
                console.log('Mongoose default connection disconnected');
            });
            process.on('SIGINT', function () {
                mongoose.connection.close(function () {
                    console.log('Mongoose default connection disconnected through app termination');
                    process.exit(0);
                });
            });
        }
    }
}
