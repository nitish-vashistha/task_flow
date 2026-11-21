package com.taskflow.service;

import com.taskflow.dto.CreateTaskRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.model.Project;
import com.taskflow.model.Task;
import com.taskflow.model.TaskPriority;
import com.taskflow.model.TaskStatus;
import com.taskflow.model.User;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTests {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    private TaskService taskService;

    @BeforeEach
    void init() {
        taskService = new TaskService(taskRepository, projectRepository, userRepository, new TaskSortStrategy());
    }

    @Test
    void shouldCreateTaskForValidProject() {
        User user = new User("User", "u@flow.dev", "pwd");
        user.setId(2L);
        Project project = new Project("P1", "D1", user);
        project.setId(5L);

        when(projectRepository.findByIdAndOwnerId(5L, 2L)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> {
            Task t = i.getArgument(0);
            t.setId(11L);
            return t;
        });

        CreateTaskRequest req = new CreateTaskRequest("T1", "D1", TaskPriority.HIGH, LocalDate.now().plusDays(1), null);
        TaskResponse res = taskService.createTask(5L, req, 2L);

        assertNotNull(res);
        assertEquals("T1", res.title());
        assertEquals(TaskStatus.TODO, res.status());
    }

    @Test
    void shouldRejectPastDueDate() {
        User user = new User("User", "u@flow.dev", "pwd");
        user.setId(2L);
        Project project = new Project("P1", "D1", user);

        when(projectRepository.findByIdAndOwnerId(5L, 2L)).thenReturn(Optional.of(project));

        CreateTaskRequest req = new CreateTaskRequest("T1", "D1", TaskPriority.LOW, LocalDate.now().minusDays(1), null);
        assertThrows(IllegalArgumentException.class, () -> taskService.createTask(5L, req, 2L));
    }

    @Test
    void shouldUpdateTaskStatus() {
        User user = new User("User", "u@flow.dev", "pwd");
        user.setId(2L);
        Project project = new Project("P1", "D1", user);
        Task task = new Task("T1", "D1", TaskPriority.MEDIUM, null, project, null);
        task.setId(99L);

        when(taskRepository.findById(99L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskResponse res = taskService.updateTaskStatus(99L, TaskStatus.DONE, 2L);
        assertEquals(TaskStatus.DONE, res.status());
    }

    @Test
    void shouldDeleteTask() {
        User user = new User("User", "u@flow.dev", "pwd");
        user.setId(2L);
        Project project = new Project("P1", "D1", user);
        Task task = new Task("T1", "D1", TaskPriority.MEDIUM, null, project, null);

        when(taskRepository.findById(99L)).thenReturn(Optional.of(task));
        taskService.deleteTask(99L, 2L);

        verify(taskRepository).delete(task);
    }
}
