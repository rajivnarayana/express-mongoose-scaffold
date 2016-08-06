import { Model as MongooseModel, Types, Document, model } from "mongoose";

export class ODM {
    constructor(private Model : MongooseModel) {
    }

    private getPathsToPopulate() {
        return Object.keys(this.Model.schema.paths)
            .filter(path=> !path.startsWith("_"))
            .filter(path => typeof this.Model.schema.paths[path].options.ref !== 'undefined')

    }

    public async list() : Promise<Document[]> {
        let paths = this.getPathsToPopulate();
        return await this.Model.find({}).populate(paths.join(', ')).exec();
    }

    public async add(doc) : Promise<Document> {
        return await this.Model.create(doc);
    }

    public async view(id) : Promise<Document> {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Unknown Record');
        }
        let paths = this.getPathsToPopulate();
        return await this.Model.findById(id).populate(paths.join(', ')); 
    }

    public async read(id) {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Unknown Record');
        }
        return await this.Model.findById(id).exec();
    }
    
    public  async update(id, keysToSet = null, keysToUnset = null): Promise<Document> {
        let updates = {};
        if (keysToSet) {
            updates['$set'] = keysToSet;
        }

        if (keysToUnset) {
            updates['$unset'] = keysToUnset;
        }

        return await this.Model.findByIdAndUpdate(id, updates, { 'new': true }).exec();  
    }
    
    public async remove(id) {
        return await this.Model.findByIdAndRemove(id).exec();
    }

    public async listAsSelectOptions(collection) {
        let documents = await model(collection).find({}).exec();
        return documents.reduce((prev, doc) => {
            prev[doc.id] = doc.name || doc.title;
            return prev;
        }, {})
    }
}
