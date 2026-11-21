package com.taskflow.config;

import com.taskflow.model.Project;
import com.taskflow.model.Task;
import com.taskflow.model.TaskPriority;
import com.taskflow.model.TaskStatus;
import com.taskflow.model.User;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        User alex = new User("Alex Morgan", "alex@taskflow.dev", passwordEncoder.encode("password123"));
        User sarah = new User("Sarah Connor", "sarah@taskflow.dev", passwordEncoder.encode("password123"));
        userRepository.save(alex);
        userRepository.save(sarah);

        Project project = new Project(
                "TaskFlow MVP",
                "Initial release of the team task tracker",
                alex
        );
        projectRepository.save(project);

        Task task1 = new Task(
                "Setup Spring Boot project",
                "Configure dependencies and security",
                TaskPriority.HIGH,
                LocalDate.now().minusDays(3),
                project,
                alex
        );
        task1.setStatus(TaskStatus.DONE);

        Task task2 = new Task(
                "Build Kanban Board UI",
                "React board with TODO, IN_PROGRESS, DONE columns",
                TaskPriority.HIGH,
                LocalDate.now().plusDays(2),
                project,
                sarah
        );
        task2.setStatus(TaskStatus.IN_PROGRESS);

        Task task3 = new Task(
                "Write automated tests",
                "Unit tests and integration tests",
                TaskPriority.MEDIUM,
                LocalDate.now().plusDays(5),
                project,
                alex
        );
        task3.setStatus(TaskStatus.TODO);

        Task task4 = new Task(
                "Fix overdue styling banner",
                "Highlight tasks with past due date",
                TaskPriority.LOW,
                LocalDate.now().minusDays(1),
                project,
                null
        );
        task4.setStatus(TaskStatus.TODO);

        taskRepository.save(task1);
        taskRepository.save(task2);
        taskRepository.save(task3);
        taskRepository.save(task4);
    }
}
