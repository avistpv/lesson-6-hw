import { TaskService } from './task.service';
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
  TaskDeadlineResult
} from './task.types';

export class TaskController {
  private taskService: TaskService;

  constructor(filePath?: string) {
    this.taskService = new TaskService(filePath);
  }

  createTask(data: CreateTaskData): { success: boolean; data?: TaskType; error?: string } {
    try {
      const task = this.taskService.createTask(data);
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getAllTasks(): { success: boolean; data?: TaskType[]; error?: string } {
    try {
      const tasks = this.taskService.getAllTasks();
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getTaskById(id: string): { success: boolean; data?: TaskType; error?: string } {
    try {
      const task = this.taskService.getTaskById(id);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getTasksByStatus(status: TaskStatus): { success: boolean; data?: TaskType[]; error?: string } {
    try {
      const tasks = this.taskService.getTasksByStatus(status);
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getTasksByPriority(priority: Priority): { success: boolean; data?: TaskType[]; error?: string } {
    try {
      const tasks = this.taskService.getTasksByPriority(priority);
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getTasksByAssignee(assignee: string): { success: boolean; data?: TaskType[]; error?: string } {
    try {
      const tasks = this.taskService.getTasksByAssignee(assignee);
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  updateTask(id: string, data: UpdateTaskData): { success: boolean; data?: TaskType; error?: string } {
    try {
      const task = this.taskService.updateTask(id, data);
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  changeTaskStatus(id: string, status: TaskStatus): { success: boolean; data?: TaskType; error?: string } {
    try {
      const task = this.taskService.changeTaskStatus(id, status);
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  deleteTask(id: string): { success: boolean; error?: string } {
    try {
      const deleted = this.taskService.deleteTask(id);
      if (!deleted) {
        return { success: false, error: 'Task not found' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getTaskStatistics(): { success: boolean; data?: any; error?: string } {
    try {
      const statistics = this.taskService.getTaskStatistics();
      return { success: true, data: statistics };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  searchTasks(query: string): { success: boolean; data?: TaskType[]; error?: string } {
    try {
      const tasks = this.taskService.searchTasks(query);
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  clearAllTasks(): { success: boolean; error?: string } {
    try {
      this.taskService.clearAllTasks();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getTaskCount(): { success: boolean; data?: number; error?: string } {
    try {
      const tasks = this.taskService.getAllTasks();
      return { success: true, data: tasks.length };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
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

  getOverdueTasks(): { success: boolean; data?: TaskType[]; error?: string } {
    try {
      const tasks = this.taskService.getOverdueTasks();
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getTasksDueSoon(days: number = 7): { success: boolean; data?: TaskType[]; error?: string } {
    try {
      const tasks = this.taskService.getTasksDueSoon(days);
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getTasksBySprint(sprintId: string): { success: boolean; data?: TaskType[]; error?: string } {
    try {
      const tasks = this.taskService.getTasksBySprint(sprintId);
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getEnhancedStatistics(): { success: boolean; data?: any; error?: string } {
    try {
      const statistics = this.taskService.getEnhancedStatistics();
      return { success: true, data: statistics };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  initializeTasks(): { success: boolean; message?: string; error?: string } {
    return this.taskService.initializeTasks();
  }
}