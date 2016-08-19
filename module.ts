import { Model as MongooseModel, Types, Document, model,Schema } from "mongoose";

export class ODM {
    constructor(private Model : MongooseModel) {
    }

    private getPathsToPopulate() {
        return Object.keys(this.Model.schema.paths)
            .filter(path=> !path.startsWith("_"))
            .filter(path => typeof this.Model.schema.paths[path].options.ref !== 'undefined')

    }

    private getPathsToSearch() {
        return Object.keys(this.Model.schema.paths)
            .filter(path=> !path.startsWith("_"))
    }

    public async list(options = {}) : Promise<Document[]> {
        let paths = this.getPathsToPopulate();
        return await this.Model.find(options).populate(paths.join(', ')).exec();
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

    public async search(body) {
        let searchQuery = {};
        let pathsToSearch = this.getPathsToSearch();
        Object.keys(body)
            .filter(key => pathsToSearch.indexOf(key) != undefined)
            .reduce((prev, key)=>{
                let val = this.Model.schema.paths[key];
                if (val.options.type == String) {
                    // if (val.enumValues && val.enumValues.length) {
                    // }
                    prev[key] = new RegExp(body[key],'i');
                } else if (val.options.type == Boolean) {
                    prev[key] = JSON.parse(body[key])
                }
                else if (val.options.type == Number) {
                    prev[key] = JSON.parse(body[key])
                }
                else if (val.options.type == Schema.ObjectId && val.options.ref) {
                    prev[key] =body[key]
                }                                  
            return prev;
        },searchQuery);
        return await this.list(searchQuery);
    }
}