const mongoose = require("mongoose");

const TasksSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    dueDate: { type: Date },
    taskStatus: {type: Boolean}
});

module.exports = mongoose.model("tasks", TasksSchema);