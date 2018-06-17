import * as mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';

import * as _ from 'lodash';

import { MongoConfiguration } from './configuration';
import { MongoDb } from './db';

export interface SchemaOptions {
    autoIncrement?: boolean;
    autoIncrementOptions?: {
        field?: string;
        startAt?: number;
        incrementBy?: number;
    };
}

export abstract class MongoRepository {
    private uri: string;

    constructor() {
        this.uri = MongoConfiguration.uri;
        this.addSchemas();
    }

    protected connect(): Promise<{}> {
        return MongoDb.open();
    }

    protected findOne<T extends mongoose.Document>(
        model: mongoose.Model<T>,
        query: any,
        callback: (err: Error, result: T) => any
    ): void {
        this.connect()
            .then(() => model.findOne(query, callback))
            .catch((err) => callback(err, null));
    }
    protected findOneAndSave<T extends mongoose.Document>(
        model: mongoose.Model<T>,
        query: any,
        update: any,
        callback: (err: Error, result: T) => any
    ): void {
        this.connect()
            .then(() =>
                model.findOne(query, (err: Error, result: T) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (result) {
                            Object.assign(result, update);
                            result.save(callback);
                        } else {
                            model.create(update, callback);
                        }
                    }
                })
            )
            .catch((err) => callback(err, null));
    }

    protected remove<T extends mongoose.Document>(
        model: mongoose.Model<T>,
        query: any,
        callback: (err: Error) => any
    ): void {
        this.connect()
            .then(() => model.remove(query, (err) => callback(err)))
            .catch((err) => callback(err));
    }

    // protected addPreSaveKindPlugin<T extends mongoose.Document>(model: mongoose.Model<T>): void {
    //     model.schema.plugin((schema: mongoose.Schema, {}) => {
    //         schema.pre('save', function(next) {
    //             this.kind = schema.path;
    //             next();
    //         });
    //     });
    // }

    protected addModel<T extends mongoose.Document>(
        modelName: string,
        schema: mongoose.Schema,
        options?: SchemaOptions
    ): mongoose.Model<T> {
        if (!_.includes(mongoose.modelNames(), modelName)) {
            if (MongoConfiguration.useAutoIncrement && options && options.autoIncrement) {
                schema.plugin(autoIncrement, {
                    model: modelName,
                    field: options.autoIncrementOptions.field,
                    startAt: options.autoIncrementOptions.startAt,
                    incrementBy:  options.autoIncrementOptions.incrementBy ?
                        options.autoIncrementOptions.incrementBy :
                        1
                });
            }
            mongoose.model<T>(modelName, schema);
        }
        return mongoose.model<T>(modelName);
    }

    protected addModelDescriminator<T extends mongoose.Document>(
        parentModel: mongoose.Model<mongoose.Document>,
        modelName,
        schema: mongoose.Schema
    ) {
        return !_.includes(mongoose.modelNames(), modelName)
            ? parentModel.discriminator<T>(modelName, schema)
            : mongoose.model<T>(modelName);
    }

    protected abstract addSchemas(): void;
}
