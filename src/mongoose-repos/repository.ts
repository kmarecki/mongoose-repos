/// <reference path="../../typings/index.d.ts"/>
import * as mongoose from 'mongoose';
import * as _ from 'underscore';

import {MongoConfiguration} from './configuration';

export abstract class MongoRepository {

    private uri: string;

    constructor() {
        this.uri = MongoConfiguration.uri;
        this.addSchemas();
    }

    protected connect(): void {
        mongoose.set('debug', MongoConfiguration.debug);
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(this.uri);

            mongoose.connection.on('connected', () => {
                console.log('Mongoose default connection open to ' + this.uri);
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

    protected addPreSaveKindPlugin<T extends mongoose.Document>(model: mongoose.Model<T>): void {
        model.schema.plugin((schema: mongoose.Schema, {}) => {
            schema.pre('save', function (next) {
                this.kind = schema.path;
                next();
            });
        });
    }

    protected addModel<T extends mongoose.Document>(modelName: string, schema: mongoose.Schema): mongoose.Model<T> {
        return (!_.contains(mongoose.modelNames(), modelName)) ?
            mongoose.model<T>(modelName, schema) :
            mongoose.model<T>(modelName);
    }

    protected addModelDescriminator<T extends mongoose.Document>(
        parentModel: mongoose.Model<mongoose.Document>, modelName, schema: mongoose.Schema) {
        return (!_.contains(mongoose.modelNames(), modelName)) ?
            parentModel.discriminator<T>(modelName, schema) :
            mongoose.model<T>(modelName);
    }

    protected abstract addSchemas(): void;
}
