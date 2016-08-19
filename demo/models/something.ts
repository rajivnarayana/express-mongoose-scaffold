import { Schema, model as Model } from "mongoose";

let schema = new Schema({
    name: String,
    vegetarian: Boolean,
    taste: { type: String, enum: ['sweet', 'sour', 'bitter', 'tangy'] },
    category: { type: Schema.Types.ObjectId, required: true, ref: 'categories' },
});
export var model = Model('food-items', schema);