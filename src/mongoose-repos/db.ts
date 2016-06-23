import * as mongoose from 'mongoose';

import {MongoConfiguration} from './configuration';

export class MongoDb {
    static dropDatabase(call: (err, result) => any): void {
        let uri = MongoConfiguration.uri;
        let conn = mongoose.connect(uri);
        conn.connection.db.dropDatabase();
        call(undefined, undefined);
    }
}
