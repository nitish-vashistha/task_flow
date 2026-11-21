package com.taskflow.dto;

import com.taskflow.model.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 120, message = "Title cannot exceed 120 characters")
        String title,

        String description,

        TaskPriority priority,

        LocalDate dueDate,

        Long assigneeId
) {}
