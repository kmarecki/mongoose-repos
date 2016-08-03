import * as mongoose from 'mongoose';
import * as autoIncrement from 'mongoose-auto-increment';

import * as _ from 'underscore';

import {MongoConfiguration} from './configuration';
import {MongoDb} from './db';

export interface SchemaOptions {
    useAutoIncrement?: boolean;
}

export abstract class MongoRepository {

    private uri: string;

    constructor() {
        this.uri = MongoConfiguration.uri;
        this.addSchemas();
    }

    protected connect(): void {
        MongoDb.open();
    }

    protected addPreSaveKindPlugin<T extends mongoose.Document>(model: mongoose.Model<T>): void {
        model.schema.plugin((schema: mongoose.Schema, {}) => {
            schema.pre('save', function (next) {
                this.kind = schema.path;
                next();
            });
        });
    }

    protected addModel<T extends mongoose.Document>(modelName: string, schema: mongoose.Schema, options?: SchemaOptions): mongoose.Model<T> {
        let model = (!_.contains(mongoose.modelNames(), modelName)) ?
            mongoose.model<T>(modelName, schema) :
            mongoose.model<T>(modelName);
        if (MongoConfiguration.useAutoIncrement && options && options.useAutoIncrement) {
            autoIncrement.plugin(schema, modelName);
        }
        return model;
    }

    protected addModelDescriminator<T extends mongoose.Document>(
        parentModel: mongoose.Model<mongoose.Document>, modelName, schema: mongoose.Schema) {
        return (!_.contains(mongoose.modelNames(), modelName)) ?
            parentModel.discriminator<T>(modelName, schema) :
            mongoose.model<T>(modelName);
    }

    protected abstract addSchemas(): void;
}
