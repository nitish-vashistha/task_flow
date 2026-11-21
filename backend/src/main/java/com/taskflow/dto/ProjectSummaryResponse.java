package com.taskflow.dto;

public record ProjectSummaryResponse(
        long total,
        long todo,
        long inProgress,
        long done,
        long overdue
) {}
