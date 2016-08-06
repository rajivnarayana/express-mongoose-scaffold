import { Schema, model as Model } from "mongoose";

let schema = new Schema({
    name : String,
    description : String
});

export var model = Model('categories', schema);
