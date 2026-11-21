package com.taskflow.service;

import com.taskflow.dto.CreateProjectRequest;
import com.taskflow.dto.ProjectResponse;
import com.taskflow.dto.ProjectSummaryResponse;
import com.taskflow.model.Project;
import com.taskflow.model.Task;
import com.taskflow.model.TaskStatus;
import com.taskflow.model.User;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public ProjectService(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    public List<ProjectResponse> getUserProjects(Long userId) {
        return projectRepository.findByOwnerId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProjectResponse createProject(CreateProjectRequest request, User owner) {
        Project project = new Project(request.name(), request.description(), owner);
        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public Project getProjectIfOwner(Long projectId, Long userId) {
        return projectRepository.findByIdAndOwnerId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or unauthorized"));
    }

    public ProjectSummaryResponse getProjectSummary(Long projectId, Long userId) {
        getProjectIfOwner(projectId, userId);

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        LocalDate today = LocalDate.now();

        long total = tasks.size();
        long todo = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long overdue = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(today))
                .count();

        return new ProjectSummaryResponse(total, todo, inProgress, done, overdue);
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt()
        );
    }
}
