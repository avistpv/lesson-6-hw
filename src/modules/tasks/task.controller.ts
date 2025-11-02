import {TaskService} from './task.service';
import {
    CreateTaskData,
    UpdateTaskData,
    TaskStatus,
    Priority,
    TaskType,
    TaskFilters,
    TaskOperationResult,
    TaskDetailsResult,
    TaskDeleteResult,
    TaskFilterResult,
    TaskDeadlineResult,
    ApiResponse,
    TaskStatistics,
    EnhancedTaskStatistics
} from './task.types';

export class TaskController {
    private taskService: TaskService;

    constructor(filePath?: string) {
        this.taskService = new TaskService(filePath);
    }

    private handleResult<T>(serviceCall: () => T): ApiResponse<T> {
        try {
            const data = serviceCall();
            return {success: true, data};
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    createTask(data: CreateTaskData): ApiResponse<TaskType> {
        return this.handleResult(() => this.taskService.createTask(data));
    }

    getAllTasks(): ApiResponse<TaskType[]> {
        return this.handleResult(() => this.taskService.getAllTasks());
    }

    getTaskById(id: string): ApiResponse<TaskType> {
        return this.handleResult(() => {
            const task = this.taskService.getTaskById(id);
            if (!task) {
                throw new Error('Task not found');
            }
            return task;
        });
    }

    getTasksByStatus(status: TaskStatus): ApiResponse<TaskType[]> {
        return this.handleResult(() => this.taskService.getTasksByStatus(status));
    }

    getTasksByPriority(priority: Priority): ApiResponse<TaskType[]> {
        return this.handleResult(() => this.taskService.getTasksByPriority(priority));
    }

    getTasksByAssignee(assignee: string): ApiResponse<TaskType[]> {
        return this.handleResult(() => this.taskService.getTasksByAssignee(assignee));
    }

    updateTask(id: string, data: UpdateTaskData): ApiResponse<TaskType> {
        return this.handleResult(() => this.taskService.updateTask(id, data));
    }

    changeTaskStatus(id: string, status: TaskStatus): ApiResponse<TaskType> {
        return this.handleResult(() => this.taskService.changeTaskStatus(id, status));
    }

    deleteTask(id: string): ApiResponse<void> {
        return this.handleResult(() => {
            const deleted = this.taskService.deleteTask(id);
            if (!deleted) {
                throw new Error('Task not found');
            }
        });
    }

    getTaskStatistics(): ApiResponse<TaskStatistics> {
        return this.handleResult(() => this.taskService.getTaskStatistics());
    }

    searchTasks(query: string): ApiResponse<TaskType[]> {
        return this.handleResult(() => this.taskService.searchTasks(query));
    }

    clearAllTasks(): ApiResponse<void> {
        return this.handleResult(() => {
            this.taskService.clearAllTasks();
        });
    }

    getTaskCount(): ApiResponse<number> {
        return this.handleResult(() => this.taskService.getAllTasks().length);
    }

    getTaskDetails(id: string): TaskDetailsResult {
        return this.taskService.getTaskDetails(id);
    }

    createTaskWithValidation(data: CreateTaskData): TaskOperationResult {
        return this.taskService.createTaskWithValidation(data);
    }

    updateTaskWithValidation(id: string, data: UpdateTaskData): TaskOperationResult {
        return this.taskService.updateTaskWithValidation(id, data);
    }

    deleteTaskWithFile(id: string): TaskDeleteResult {
        return this.taskService.deleteTaskWithFile(id);
    }

    filterTasks(filters: TaskFilters): TaskFilterResult {
        return this.taskService.filterTasks(filters);
    }

    checkTaskDeadline(id: string): TaskDeadlineResult {
        return this.taskService.checkTaskDeadline(id);
    }

    getOverdueTasks(): ApiResponse<TaskType[]> {
        return this.handleResult(() => this.taskService.getOverdueTasks());
    }

    getTasksDueSoon(days: number = 7): ApiResponse<TaskType[]> {
        return this.handleResult(() => this.taskService.getTasksDueSoon(days));
    }

    getTasksBySprint(sprintId: string): ApiResponse<TaskType[]> {
        return this.handleResult(() => this.taskService.getTasksBySprint(sprintId));
    }

    getEnhancedStatistics(): ApiResponse<EnhancedTaskStatistics> {
        return this.handleResult(() => this.taskService.getEnhancedStatistics());
    }

    initializeTasks(): { success: boolean; message?: string; error?: string } {
        return this.taskService.initializeTasks();
    }
}