// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:{ 
    type: String, 
    required: true, 
    trim: true },
  description:{ type: String },
  priority:{ type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH'], 
    default: 'MEDIUM' },
  status:{ type: String, 
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'], 
    default: 'TODO' },
  assigneeId:{ type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserDetails',
     required: true },
  projectId:
  { type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true },
  createdBy:{ type: mongoose.Schema.Types.ObjectId,
     ref: 'UserDetails', 
     required: true },
  dueDate:{ type: Date },
  statusHistory: [{
    from:      { type: String },
    to:        { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetails' },
    changedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Indexes
taskSchema.index({ status: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assigneeId: 1, status: 1 }); // compound — covers list + filter query

module.exports = mongoose.model('Task', taskSchema);