package com.taskflow.service;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class TaskSortStrategy {

    public Sort createSort(String sortBy, String direction) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String property = switch (sortBy != null ? sortBy.toLowerCase() : "duedate") {
            case "priority" -> "priority";
            case "title" -> "title";
            case "createdat" -> "createdAt";
            default -> "dueDate";
        };
        return Sort.by(dir, property);
    }
}
