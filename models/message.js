const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = model("Message", messageSchema);

module.exports = Message;