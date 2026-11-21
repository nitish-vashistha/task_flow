package com.taskflow.controller;

import com.taskflow.dto.CreateTaskRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.UpdateTaskRequest;
import com.taskflow.dto.UpdateTaskStatusRequest;
import com.taskflow.model.User;
import com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/api/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal User user
    ) {
        TaskResponse response = taskService.createTask(projectId, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/tasks/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal User user
    ) {
        TaskResponse response = taskService.updateTask(id, request, user.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/tasks/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            @AuthenticationPrincipal User user
    ) {
        TaskResponse response = taskService.updateTaskStatus(id, request.status(), user.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/tasks/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        taskService.deleteTask(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
