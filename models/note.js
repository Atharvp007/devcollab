const { Schema, model } = require("mongoose");

const noteSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        unique: true, // One note per project
    },
    content: {
        type: String,
        default: "",
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
}, { timestamps: true });

const Note = model("Note", noteSchema);

module.exports = Note;