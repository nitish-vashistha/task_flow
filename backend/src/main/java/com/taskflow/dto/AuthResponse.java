package com.taskflow.dto;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email
) {}
