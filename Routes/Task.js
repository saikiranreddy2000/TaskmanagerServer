const express=require('express')
const TaskRoute=express.Router()
const JwtAuth= require('../Middleware/JwtAuth')
const permit=require('../Middleware/RBAC')
const Task =require('../Models/TaskModel')
const VALID_TRANSITIONS= require('../constants/taskTransitions')
TaskRoute.post('/task',JwtAuth,permit('ADMIN','MANAGER'),async (req, res) => {
  try {
    const { title, description, priority, assigneeId, projectId, dueDate } = req.body;

    if (!title)      return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: 'title is required' });
    if (!assigneeId) return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: 'assigneeId is required' });
    if (!projectId)  return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: 'projectId is required' });
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: 'due_date must be a future date' });
    }

    const task = await new Task({
      title, description, priority, assigneeId, projectId, dueDate,
      createdBy: req.user._id,
      statusHistory: [{ from: null, to: 'TODO', changedBy: req.user._id }]
    });
    await task.save()

    res.status(201).json({ status: 201, data: task });
  } catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
})
TaskRoute.get('/task',JwtAuth,permit('ADMIN','MANAGER'),async (req, res) => {
  try{
    const allTasks=await Task.find({})
      .populate('assigneeId', 'name')
      .populate('createdBy', 'name')
      .populate({
        path: 'projectId',
        select: 'name description createdBy isActive createdAt updatedAt',
        populate: {
          path: 'createdBy',
          select: 'name'
        }
      })
      .populate('statusHistory.changedBy', 'name')

    res.json({ status: 200, data: allTasks })
  }
  catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
})
TaskRoute.get('/task/:id',JwtAuth,permit('ADMIN','MANAGER'),async (req, res) => {
  try{
    const task = await Task.findOne({ _id: req.params.id})
      .populate('assigneeId', 'name email')
      .populate('projectId', 'name');

    if (!task) return res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'Task not found' });


    res.status(200).json({ status: 200, data: task });
  } 
  catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
}
);

TaskRoute.get('/member/tasks',JwtAuth,permit('ADMIN','MANAGER','MEMBER'),async (req, res) => {
  try {
    const tasks = await Task.find({ assigneeId: req.user._id })
      .populate('assigneeId', 'name email role isActive')
      .populate('createdBy', 'name email role')
      .populate({
        path: 'projectId',
        select: 'name description createdBy isActive createdAt updatedAt',
        populate: {
          path: 'createdBy',
          select: 'name email role'
        }
      })
      .populate('statusHistory.changedBy', 'name email role')

    res.status(200).json({ status: 200, data: tasks });
  } catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
})

TaskRoute.get('/member/tasks/:id',JwtAuth,permit('ADMIN','MANAGER','MEMBER'),async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, assigneeId: req.user._id })
      .populate('assigneeId', 'name ')
      .populate('createdBy', 'name role')
      .populate({
        path: 'projectId',
        select: 'name description createdBy isActive createdAt updatedAt',
        populate: {
          path: 'createdBy',
          select: 'name role'
        }
      })
      .populate('statusHistory.changedBy', 'name email role')

    if (!task) throw new Error('Task not found');

    res.status(200).json({ status: 200, data: task });
  } catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
})

TaskRoute.patch('/member/tasks/:id/status',JwtAuth,permit('ADMIN','MANAGER','MEMBER'),async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) throw new Error('status is required');

    const task = await Task.findOne({ _id: req.params.id, assigneeId: req.user._id });
    if (!task) throw new Error('Task not found');

    if (!VALID_TRANSITIONS[task.status].includes(status)) {
      throw new Error(`Cannot transition from ${task.status} to ${status}`)
    }

    task.statusHistory.push({ from: task.status, to: status, changedBy: req.user._id });
    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assigneeId', 'name email role isActive')
      .populate('createdBy', 'name email role')
      .populate({
        path: 'projectId',
        select: 'name description createdBy isActive createdAt updatedAt',
        populate: {
          path: 'createdBy',
          select: 'name email role'
        }
      })
      .populate('statusHistory.changedBy', 'name email role')

    res.status(200).json({ status: 200, data: updatedTask });
  } catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
})

TaskRoute.patch('/tasks/:id/status',JwtAuth,permit('ADMIN','MANAGER'),async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) throw new Error('status is required');

    const task = await Task.findOne({ _id: req.params.id});
    if (!task) throw new Error('Task not found')

    // Only assignee or ADMIN/MANAGER can change status
    const isAssignee = task.assigneeId.toString() === req.user._id.toString();
    const isPrivileged = ['ADMIN', 'MANAGER'].includes(req.user.role);
    if (!isAssignee && !isPrivileged) {
       throw new Error('Only the assignee or a manager can update task status')
    }

    // Validate transition
    if (!VALID_TRANSITIONS[task.status].includes(status)) {
      throw new Error(`Cannot transition from ${task.status} to ${status}`)
    }

    task.statusHistory.push({ from: task.status, to: status, changedBy: req.user._id });
    task.status = status;
    await task.save();

    res.status(200).json({ status: 200, data: task });
  } catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
})

TaskRoute.delete('/task/:id', JwtAuth,permit('ADMIN','MANAGER'),async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id });
    if (!task) throw new Error('Task not found')

    res.status(200).json({ status: 200, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
})
module.exports=TaskRoute
