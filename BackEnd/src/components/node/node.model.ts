import { Schema, model, Types } from "mongoose";

export interface INode {
  prev: Types.ObjectId | null,
  next: Types.ObjectId | null,
  version: number
}

const NodeSchema = new Schema<INode>({
  prev: {
    type: Schema.Types.ObjectId,
    default: null
  },
  next: {
    type: Schema.Types.ObjectId,
    default: null
  },
  version: {
    type: Number,
    default: 0
  }
});

NodeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    delete ret._id;
  }
});

export default model<INode>("Node", NodeSchema);
