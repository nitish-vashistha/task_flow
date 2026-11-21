package com.taskflow.service;

import com.taskflow.dto.CreateTaskRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.UpdateTaskRequest;
import com.taskflow.model.Project;
import com.taskflow.model.Task;
import com.taskflow.model.TaskStatus;
import com.taskflow.model.User;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public TaskResponse createTask(Long projectId, CreateTaskRequest request, Long userId) {
        Project project = projectRepository.findByIdAndOwnerId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or unauthorized"));

        if (request.dueDate() != null && request.dueDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Due date cannot be in the past");
        }

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new IllegalArgumentException("Assignee not found"));
        }

        Task task = new Task(
                request.title(),
                request.description(),
                request.priority(),
                request.dueDate(),
                project,
                assignee
        );

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request, Long userId) {
        Task task = getTaskIfProjectOwner(taskId, userId);

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new IllegalArgumentException("Assignee not found"));
        }

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setAssignee(assignee);

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status, Long userId) {
        Task task = getTaskIfProjectOwner(taskId, userId);
        task.setStatus(status);
        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public void deleteTask(Long taskId, Long userId) {
        Task task = getTaskIfProjectOwner(taskId, userId);
        taskRepository.delete(task);
    }

    private Task getTaskIfProjectOwner(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (!task.getProject().getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to modify this task");
        }
        return task;
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getAssignee() != null ? task.getAssignee().getId() : null,
                task.getAssignee() != null ? task.getAssignee().getName() : null,
                task.getProject().getId(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
