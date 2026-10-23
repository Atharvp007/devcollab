const {Schema,model} = require("mongoose")


const taskSchema = new Schema({
  title: {
    type:String,
    required:true,
  },
  description: {
    type:String,
    required:true,
  },
  projectId: {        
    type: Schema.Types.ObjectId,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    required:true,
  },
  createdBy: Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ["todo", "in-progress", "completed"],
    default: "todo"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    required:true,
  },

  dueDate: {
    type:Date,
    required:true,
  },

  attachments: [String], // optional (docs/links)

},{timestamps:true})

const Task = model("task",taskSchema);

module.exports = Task;