import {
  TaskType,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  Priority,
  BugSeverity,
  TaskInterface,
  SubtaskInterface,
  BugInterface,
  StoryInterface,
  EpicInterface,
  TaskOperationResult,
  TaskDetailsResult,
  TaskDeleteResult,
  TaskFilterResult,
  TaskDeadlineResult,
  TaskFilters
} from './task.types';
import * as fs from 'fs';
import * as path from 'path';
import {
  messages, 
  defaultStatus, 
  defaultPriority,
  taskTitleMinLength,
  taskTitleMaxLength,
  taskDescriptionMinLength,
  taskDescriptionMaxLength
} from './task.types';

export class TaskService {
  private tasks: TaskType[] = [];
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || 'tasks.json';
    this.loadTasksFromFile();
  }

  private validateTaskData(data: CreateTaskData): void {
    const validation = this.validateCreateTaskData(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
  }

  private validateUpdateData(data: UpdateTaskData): void {
    const validation = this.validateUpdateTaskData(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
  }

  private validateCreateTaskData(data: any): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required and must be a string');
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (data.title.trim().length < taskTitleMinLength) {
      errors.push(`Title must be at least ${taskTitleMinLength} characters long`);
    } else if (data.title.trim().length > taskTitleMaxLength) {
      errors.push(`Title must be no more than ${taskTitleMaxLength} characters long`);
    }
    if (!data.description || typeof data.description !== 'string') {
      errors.push('Description is required and must be a string');
    } else if (data.description.trim().length === 0) {
      errors.push('Description cannot be empty');
    } else if (data.description.trim().length < taskDescriptionMinLength) {
      errors.push(`Description must be at least ${taskDescriptionMinLength} characters long`);
    } else if (data.description.trim().length > taskDescriptionMaxLength) {
      errors.push(`Description must be no more than ${taskDescriptionMaxLength} characters long`);
    }
    if (!data.priority || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.priority)) {
      errors.push('Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL');
    }
    if (!data.type || !['Task', 'Subtask', 'Bug', 'Story', 'Epic'].includes(data.type)) {
      errors.push('Type must be one of: Task, Subtask, Bug, Story, Epic');
    }
    if (data.assignee !== undefined && data.assignee !== null) {
      if (typeof data.assignee !== 'string') {
        errors.push('Assignee must be a string');
      } else if (data.assignee.trim().length === 0) {
        errors.push('Assignee cannot be an empty string');
      }
    }
    if (data.deadline !== undefined && data.deadline !== null) {
      if (typeof data.deadline !== 'string') {
        errors.push('Deadline must be a string');
      } else if (data.deadline.trim().length === 0) {
        errors.push('Deadline cannot be an empty string');
      } else if (isNaN(Date.parse(data.deadline))) {
        errors.push('Deadline must be a valid date string');
      }
    }
    this.validateNumericField(data.estimatedHours, 'Estimated hours', errors);
    this.validateNumericField(data.actualHours, 'Actual hours', errors);
    this.validateNumericField(data.fixHours, 'Fix hours', errors);
    this.validateNumericField(data.storyPoints, 'Story points', errors);
    this.validateTypeSpecificFields(data, errors);
    return {
      success: errors.length === 0,
      errors
    };
  }

  private validateUpdateTaskData(data: any): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        errors.push('Title must be a string');
      } else if (data.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      } else if (data.title.trim().length < taskTitleMinLength) {
        errors.push(`Title must be at least ${taskTitleMinLength} characters long`);
      } else if (data.title.trim().length > taskTitleMaxLength) {
        errors.push(`Title must be no more than ${taskTitleMaxLength} characters long`);
      }
    }
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.trim().length === 0) {
        errors.push('Description cannot be empty');
      } else if (data.description.trim().length < taskDescriptionMinLength) {
        errors.push(`Description must be at least ${taskDescriptionMinLength} characters long`);
      } else if (data.description.trim().length > taskDescriptionMaxLength) {
        errors.push(`Description must be no more than ${taskDescriptionMaxLength} characters long`);
      }
    }

    if (data.priority !== undefined) {
      if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.priority)) {
        errors.push('Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL');
      }
    }
    if (data.status !== undefined) {
      if (!['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'].includes(data.status)) {
        errors.push('Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED');
      }
    }
    if (data.assignee !== undefined && data.assignee !== null) {
      if (typeof data.assignee !== 'string') {
        errors.push('Assignee must be a string');
      } else if (data.assignee.trim().length === 0) {
        errors.push('Assignee cannot be an empty string');
      }
    }

    if (data.deadline !== undefined && data.deadline !== null) {
      if (typeof data.deadline !== 'string') {
        errors.push('Deadline must be a string');
      } else if (data.deadline.trim().length === 0) {
        errors.push('Deadline cannot be an empty string');
      } else if (isNaN(Date.parse(data.deadline))) {
        errors.push('Deadline must be a valid date string');
      }
    }

    this.validateNumericField(data.estimatedHours, 'Estimated hours', errors);
    this.validateNumericField(data.actualHours, 'Actual hours', errors);
    this.validateNumericField(data.fixHours, 'Fix hours', errors);
    return {
      success: errors.length === 0,
      errors
    };
  }

  private validateNumericField(value: any, fieldName: string, errors: string[]): void {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number') {
        errors.push(`${fieldName} must be a number`);
      } else if (value < 0) {
        errors.push(`${fieldName} cannot be negative`);
      } else if (!Number.isFinite(value)) {
        errors.push(`${fieldName} must be a finite number`);
      }
    }
  }

  private validateTypeSpecificFields(data: any, errors: string[]): void {
    switch (data.type) {
      case 'Subtask':
        if (!data.parentTaskId || typeof data.parentTaskId !== 'string') {
          errors.push('Parent task ID is required for subtasks');
        } else if (data.parentTaskId.trim().length === 0) {
          errors.push('Parent task ID cannot be empty');
        }
        break;

      case 'Bug':
        if (!data.severity || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.severity)) {
          errors.push('Severity is required for bugs and must be one of: LOW, MEDIUM, HIGH, CRITICAL');
        }
        if (!data.stepsToReproduce || !Array.isArray(data.stepsToReproduce)) {
          errors.push('Steps to reproduce is required for bugs and must be an array');
        } else if (data.stepsToReproduce.length === 0) {
          errors.push('Steps to reproduce cannot be empty for bugs');
        } else {
          data.stepsToReproduce.forEach((step: any, index: number) => {
            if (typeof step !== 'string' || step.trim().length === 0) {
              errors.push(`Step ${index + 1} in steps to reproduce must be a non-empty string`);
            }
          });
        }
        if (!data.environment || typeof data.environment !== 'string') {
          errors.push('Environment is required for bugs and must be a string');
        } else if (data.environment.trim().length === 0) {
          errors.push('Environment cannot be empty for bugs');
        }
        break;

      case 'Story':
        if (!data.acceptanceCriteria || !Array.isArray(data.acceptanceCriteria)) {
          errors.push('Acceptance criteria is required for stories and must be an array');
        } else if (data.acceptanceCriteria.length === 0) {
          errors.push('Acceptance criteria cannot be empty for stories');
        } else {
          data.acceptanceCriteria.forEach((criteria: any, index: number) => {
            if (typeof criteria !== 'string' || criteria.trim().length === 0) {
              errors.push(`Acceptance criteria ${index + 1} must be a non-empty string`);
            }
          });
        }
        if (data.storyPoints === undefined || data.storyPoints === null) {
          errors.push('Story points is required for stories');
        } else if (typeof data.storyPoints !== 'number' || data.storyPoints < 0) {
          errors.push('Story points must be a non-negative number');
        }
        break;

      case 'Epic':
        if (data.stories !== undefined && data.stories !== null) {
          if (!Array.isArray(data.stories)) {
            errors.push('Stories must be an array');
          } else {
            data.stories.forEach((story: any, index: number) => {
              if (typeof story !== 'string' || story.trim().length === 0) {
                errors.push(`Story ${index + 1} must be a non-empty string`);
              }
            });
          }
        }
        break;
    }
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createTask(data: CreateTaskData): TaskType {
    this.validateTaskData(data);

    const baseTask = {
      id: this.generateId(),
      title: data.title.trim(),
      description: data.description.trim(),
      status: TaskStatus.TODO,
      priority: data.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignee: data.assignee,
      ...(data.deadline && { deadline: data.deadline })
    };

    let task: TaskType;

    switch (data.type) {
      case 'Task':
        task = {
          ...baseTask,
          type: 'Task',
          estimatedHours: data.estimatedHours,
          actualHours: data.actualHours
        } as TaskInterface;
        break;

      case 'Subtask':
        if (!data.parentTaskId) {
          throw new Error('Parent task ID is required for subtasks');
        }
        if (!this.getTaskById(data.parentTaskId)) {
          throw new Error('Parent task not found');
        }
        task = {
          ...baseTask,
          type: 'Subtask',
          parentTaskId: data.parentTaskId,
          estimatedHours: data.estimatedHours,
          actualHours: data.actualHours
        } as SubtaskInterface;
        break;

      case 'Bug':
        if (!data.severity) {
          throw new Error('Severity is required for bugs');
        }
        if (!data.stepsToReproduce || data.stepsToReproduce.length === 0) {
          throw new Error('Steps to reproduce are required for bugs');
        }
        if (!data.environment || data.environment.trim().length === 0) {
          throw new Error('Environment is required for bugs');
        }
        task = {
          ...baseTask,
          type: 'Bug',
          severity: data.severity,
          stepsToReproduce: data.stepsToReproduce,
          environment: data.environment.trim(),
          fixHours: data.fixHours
        } as BugInterface;
        break;

      case 'Story':
        if (!data.acceptanceCriteria || data.acceptanceCriteria.length === 0) {
          throw new Error('Acceptance criteria are required for stories');
        }
        if (data.storyPoints === undefined || data.storyPoints < 0) {
          throw new Error('Story points are required for stories');
        }
        task = {
          ...baseTask,
          type: 'Story',
          acceptanceCriteria: data.acceptanceCriteria,
          storyPoints: data.storyPoints,
          sprintId: data.sprintId
        } as StoryInterface;
        break;

      case 'Epic':
        task = {
          ...baseTask,
          type: 'Epic',
          stories: data.stories || [],
          targetDate: data.targetDate
        } as EpicInterface;
        break;

      default:
        throw new Error('Invalid task type');
    }

    this.tasks.push(task);
    return task;
  }

  getAllTasks(): TaskType[] {
    return [...this.tasks];
  }

  getTaskById(id: string): TaskType | undefined {
    return this.tasks.find(task => task.id === id);
  }

  getTasksByStatus(status: TaskStatus): TaskType[] {
    return this.tasks.filter(task => task.status === status);
  }

  getTasksByPriority(priority: Priority): TaskType[] {
    return this.tasks.filter(task => task.priority === priority);
  }

  getTasksByAssignee(assignee: string): TaskType[] {
    return this.tasks.filter(task => task.assignee === assignee);
  }

  getSubtasksByParentId(parentId: string): SubtaskInterface[] {
    return this.tasks.filter(task => 
      task.type === 'Subtask' && (task as SubtaskInterface).parentTaskId === parentId
    ) as SubtaskInterface[];
  }

  getStoriesBySprintId(sprintId: string): StoryInterface[] {
    return this.tasks.filter(task => 
      task.type === 'Story' && (task as StoryInterface).sprintId === sprintId
    ) as StoryInterface[];
  }

  updateTask(id: string, data: UpdateTaskData): TaskType {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    this.validateUpdateData(data);
    const existingTask = this.tasks[taskIndex];
    const updatedTask: TaskType = {
      ...existingTask,
      ...data,
      updatedAt: new Date()
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  deleteTask(id: string): boolean {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return false;
    }

    const subtasks = this.getSubtasksByParentId(id);
    if (subtasks.length > 0) {
      throw new Error('Cannot delete task with existing subtasks');
    }

    this.tasks.splice(taskIndex, 1);
    return true;
  }

  changeTaskStatus(id: string, status: TaskStatus): TaskType {
    return this.updateTask(id, { status });
  }

  getTaskStatistics() {
    const total = this.tasks.length;
    const byStatus = this.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const byPriority = this.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    const byType = this.tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus,
      byPriority,
      byType
    };
  }

  searchTasks(query: string): TaskType[] {
    const lowercaseQuery = query.toLowerCase();
    return this.tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  clearAllTasks(): void {
    this.tasks = [];
  }

  private loadTasksFromFile(): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        return;
      }

      const fileContent = fs.readFileSync(this.filePath, 'utf-8');
      const tasksData = JSON.parse(fileContent);
      const tasksWithDates = tasksData.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        ...(task.targetDate && { targetDate: new Date(task.targetDate) })
      }));
      if (Array.isArray(tasksWithDates)) {
        this.tasks = tasksWithDates as TaskType[];
      }
    } catch (error) {
      console.error('Error loading tasks from file:', error);
    }
  }

  private saveTasksToFile(): { success: boolean; error?: string } {
    try {
      const tasksForJson = this.tasks.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        ...(task.type === 'Epic' && (task as any).targetDate && { 
          targetDate: (task as any).targetDate.toISOString() 
        })
      }));
      const jsonContent = JSON.stringify(tasksForJson, null, 2);
      fs.writeFileSync(this.filePath, jsonContent, 'utf-8');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error saving tasks' 
      };
    }
  }

  getTaskDetails(id: string): TaskDetailsResult {
    const task = this.getTaskById(id);
    
    if (!task) {
      return {
        success: false,
        error: messages.taskNotFound(id)
      };
    }

    return {
      success: true,
      task
    };
  }

  createTaskWithValidation(data: CreateTaskData): TaskOperationResult {
    try {
      const existingTask = this.getTaskById(data.id || this.generateId());
      if (existingTask) {
        return {
          success: false,
          errors: [messages.taskAlreadyExists(data.id || 'unknown')]
        };
      }

      const task = this.createTask(data);
      const saveResult = this.saveTasksToFile();
      if (saveResult.success) {
        return {
          success: true,
          task: task
        };
      } else {
        return {
          success: false,
          errors: [saveResult.error || 'Failed to save task']
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : messages.unknownError]
      };
    }
  }

  updateTaskWithValidation(id: string, updates: UpdateTaskData): TaskOperationResult {
    try {
      const existingTask = this.getTaskById(id);
      
      if (!existingTask) {
        return {
          success: false,
          errors: [messages.taskNotFound(id)]
        };
      }

      const updatedTask = this.updateTask(id, updates);
      const saveResult = this.saveTasksToFile();
      if (saveResult.success) {
        return {
          success: true,
          task: updatedTask
        };
      } else {
        return {
          success: false,
          errors: [saveResult.error || 'Failed to save task']
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : messages.unknownError]
      };
    }
  }

  deleteTaskWithFile(id: string): TaskDeleteResult {
    const existingTask = this.getTaskById(id);
    
    if (!existingTask) {
      return {
        success: false,
        error: messages.taskNotFound(id)
      };
    }

    try {
      this.tasks = this.tasks.filter(task => task.id !== id);
      const saveResult = this.saveTasksToFile();
      if (saveResult.success) {
        return {
          success: true,
          message: messages.taskDeletedSuccess(existingTask.title, id)
        };
      } else {
        return {
          success: false,
          error: saveResult.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : messages.unknownError
      };
    }
  }

  filterTasks(filters: TaskFilters): TaskFilterResult {
    const filteredTasks = this.tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignee && task.assignee !== filters.assignee) return false;
      if (filters.type && task.type !== filters.type) return false;
      if (filters.createdAfter && new Date(task.createdAt) < new Date(filters.createdAfter)) return false;
      if (filters.createdBefore && new Date(task.createdAt) > new Date(filters.createdBefore)) return false;
      const taskDeadline = this.getTaskDeadline(task);
      if (filters.deadlineAfter && (!taskDeadline || new Date(taskDeadline) < new Date(filters.deadlineAfter))) return false;
      if (filters.deadlineBefore && (!taskDeadline || new Date(taskDeadline) > new Date(filters.deadlineBefore))) return false;
      
      return true;
    });

    return {
      success: true,
      tasks: filteredTasks,
      count: filteredTasks.length
    };
  }

  checkTaskDeadline(id: string): TaskDeadlineResult {
    const task = this.tasks.find(task => task.id === id);
    
    if (!task) {
      return {
        success: false,
        error: messages.taskNotFound(id)
      };
    }

    const deadline = this.getTaskDeadline(task);
    if (!deadline) {
      return {
        success: true,
        task,
        isCompletedOnTime: undefined,
        daysUntilDeadline: undefined,
        isOverdue: false
      };
    }

    const now: Date = new Date();
    const deadlineDate: Date = new Date(deadline);
    const daysUntilDeadline: number = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue: boolean = now > deadlineDate;
    const isCompletedOnTime: boolean = task.status === 'DONE' && !isOverdue;

    return {
      success: true,
      task,
      isCompletedOnTime,
      daysUntilDeadline,
      isOverdue
    };
  }

  getOverdueTasks(): TaskType[] {
    return this.tasks.filter(task => {
      const deadline = this.getTaskDeadline(task);
      if (!deadline) return false;
      
      const now = new Date();
      const deadlineDate = new Date(deadline);
      return now > deadlineDate && task.status !== 'DONE';
    });
  }

  getTasksDueSoon(days: number = 7): TaskType[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return this.tasks.filter(task => {
      const deadline = this.getTaskDeadline(task);
      if (!deadline) return false;
      
      const deadlineDate = new Date(deadline);
      return deadlineDate >= now && deadlineDate <= futureDate && task.status !== 'DONE';
    });
  }

  getTasksBySprint(sprintId: string): TaskType[] {
    return this.tasks.filter(task => {
      if (task.type === 'Story') {
        return (task as any).sprintId === sprintId;
      }
      return false;
    });
  }

  getEnhancedStatistics() {
    const total = this.tasks.length;
    const byStatus = this.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = this.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = this.tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byAssignee = this.tasks.reduce((acc, task) => {
      const assignee = task.assignee || 'Unassigned';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const overdue = this.getOverdueTasks().length;
    const dueSoon = this.getTasksDueSoon().length;

    return {
      total,
      byStatus,
      byPriority,
      byType,
      byAssignee,
      overdue,
      dueSoon
    };
  }

  private getTaskDeadline(task: TaskType): string | undefined {
    if ('deadline' in task && task.deadline) {
      return task.deadline;
    }
    if ('targetDate' in task && task.targetDate) {
      return task.targetDate.toISOString();
    }
    return undefined;
  }

  initializeTasks(): { success: boolean; message: string; error?: string } {
    try {
      this.loadTasksFromFile();
      return {
        success: true,
        message: `Successfully loaded ${this.tasks.length} tasks`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to initialize tasks',
        error: error instanceof Error ? error.message : messages.unknownError
      };
    }
  }
}
