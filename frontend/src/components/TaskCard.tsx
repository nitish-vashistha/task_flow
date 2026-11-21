import React from 'react'
import { Task, TaskStatus } from '../types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onStatusChange: (taskId: number, status: TaskStatus) => void
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const isOverdue =
    task.status !== 'DONE' &&
    Boolean(task.dueDate) &&
    new Date(task.dueDate!) < new Date(new Date().setHours(0, 0, 0, 0))

  const priorityClass = `priority-${task.priority.toLowerCase()}`

  return (
    <div className={`task-card ${isOverdue ? 'task-card-overdue' : ''}`}>
      <div className="task-card-header">
        <span className={`badge ${priorityClass}`}>{task.priority}</span>
        <button
          className="btn-danger-icon"
          title="Delete task"
          onClick={(e) => {
            e.stopPropagation()
            if (window.confirm('Delete this task?')) {
              onDelete(task.id)
            }
          }}
        >
          &times;
        </button>
      </div>

      <h4 className="task-title" onClick={() => onEdit(task)}>
        {task.title}
      </h4>

      {task.description && (
        <p className="task-desc" onClick={() => onEdit(task)}>
          {task.description}
        </p>
      )}

      <div className="task-meta">
        {task.dueDate && (
          <span className={`task-date ${isOverdue ? 'text-overdue' : ''}`}>
            Due: {task.dueDate} {isOverdue && '(Overdue)'}
          </span>
        )}
        {task.assigneeName && (
          <span className="task-assignee">Assignee: {task.assigneeName}</span>
        )}
      </div>

      <div className="task-card-footer">
        <label htmlFor={`status-${task.id}`} className="sr-only">
          Status
        </label>
        <select
          id={`status-${task.id}`}
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <button className="btn-edit" onClick={() => onEdit(task)}>
          Edit
        </button>
      </div>
    </div>
  )
}
