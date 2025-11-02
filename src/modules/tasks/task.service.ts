import {
    TaskType,
    CreateTaskData,
    UpdateTaskData,
    TaskStatus,
    Priority,
    BugSeverity,
    TaskOperationResult,
    TaskDetailsResult,
    TaskDeleteResult,
    TaskFilterResult,
    TaskDeadlineResult,
    TaskFilters,
    TaskStatistics,
    EnhancedTaskStatistics,
    messages
} from './task.types';
import * as fs from 'fs';
import {validateCreateTaskData, validateUpdateTaskData} from './task.validator';
import {Task, Subtask, Bug, Story, Epic} from '../models';

export class TaskService {
    private tasks: TaskType[] = [];
    private filePath: string;

    constructor(filePath?: string) {
        this.filePath = filePath || 'tasks.json';
        this.loadTasksFromFile();
    }

    private validateTaskData(data: CreateTaskData): void {
        const validation = validateCreateTaskData(data);
        if (!validation.success) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
    }

    private validateUpdateData(data: UpdateTaskData): void {
        const validation = validateUpdateTaskData(data);
        if (!validation.success) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
    }

    private createTaskInstance(
        type: string,
        id: string,
        title: string,
        description: string,
        status: TaskStatus,
        priority: Priority,
        createdAt: Date,
        updatedAt: Date,
        assignee: string | undefined,
        deadline: string | undefined,
        taskData: Record<string, unknown>
    ): TaskType {
        switch (type) {
            case 'Task':
                return new Task(
                    id,
                    title,
                    description,
                    status,
                    priority,
                    createdAt,
                    updatedAt,
                    assignee,
                    deadline,
                    taskData.estimatedHours as number | undefined,
                    taskData.actualHours as number | undefined
                );
            case 'Subtask':
                return new Subtask(
                    id,
                    title,
                    description,
                    status,
                    priority,
                    createdAt,
                    updatedAt,
                    taskData.parentTaskId as string,
                    assignee,
                    deadline,
                    taskData.estimatedHours as number | undefined,
                    taskData.actualHours as number | undefined
                );
            case 'Bug':
                return new Bug(
                    id,
                    title,
                    description,
                    status,
                    priority,
                    createdAt,
                    updatedAt,
                    taskData.severity as BugSeverity,
                    taskData.stepsToReproduce as string[],
                    taskData.environment as string,
                    assignee,
                    deadline,
                    taskData.fixHours as number | undefined
                );
            case 'Story':
                return new Story(
                    id,
                    title,
                    description,
                    status,
                    priority,
                    createdAt,
                    updatedAt,
                    taskData.acceptanceCriteria as string[],
                    taskData.storyPoints as number,
                    assignee,
                    deadline,
                    taskData.sprintId as string | undefined
                );
            case 'Epic':
                return new Epic(
                    id,
                    title,
                    description,
                    status,
                    priority,
                    createdAt,
                    updatedAt,
                    (taskData.stories as string[]) || [],
                    assignee,
                    deadline,
                    taskData.targetDate ? new Date(taskData.targetDate as string) : undefined
                );
            default:
                throw new Error(`Invalid task type: ${type}`);
        }
    }

    private generateId(): string {
        return `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    createTask(data: CreateTaskData): TaskType {
        this.validateTaskData(data);

        const id = this.generateId();
        const title = data.title.trim();
        const description = data.description.trim();
        const status = TaskStatus.TODO;
        const priority = data.priority;
        const createdAt = new Date();
        const updatedAt = new Date();
        const assignee = data.assignee;
        const deadline = data.deadline;

        if (data.type === 'Subtask') {
            if (!data.parentTaskId) {
                throw new Error('Parent task ID is required for subtasks');
            }
            if (!this.getTaskById(data.parentTaskId)) {
                throw new Error('Parent task not found');
            }
        }

        const task = this.createTaskInstance(
            data.type,
            id,
            title,
            description,
            status,
            priority,
            createdAt,
            updatedAt,
            assignee,
            deadline,
            data as unknown as Record<string, unknown>
        );

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

    getSubtasksByParentId(parentId: string): Subtask[] {
        return this.tasks.filter(task =>
            task.type === 'Subtask' && (task as Subtask).parentTaskId === parentId
        ) as Subtask[];
    }

    getStoriesBySprintId(sprintId: string): Story[] {
        return this.tasks.filter(task =>
            task.type === 'Story' && (task as Story).sprintId === sprintId
        ) as Story[];
    }

    updateTask(id: string, data: UpdateTaskData): TaskType {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        this.validateUpdateData(data);
        const existingTask = this.tasks[taskIndex];

        if (data.title !== undefined) existingTask.title = data.title;
        if (data.description !== undefined) existingTask.description = data.description;
        if (data.status !== undefined) existingTask.status = data.status;
        if (data.priority !== undefined) existingTask.priority = data.priority;
        if (data.assignee !== undefined) existingTask.assignee = data.assignee;
        if (data.deadline !== undefined) existingTask.deadline = data.deadline;
        existingTask.updatedAt = new Date();

        if (existingTask.type === 'Task' || existingTask.type === 'Subtask') {
            const task = existingTask as Task | Subtask;
            if (data.estimatedHours !== undefined) task.estimatedHours = data.estimatedHours;
            if (data.actualHours !== undefined) task.actualHours = data.actualHours;
        }
        if (existingTask.type === 'Bug') {
            const bug = existingTask as Bug;
            if (data.fixHours !== undefined) bug.fixHours = data.fixHours;
        }
        if (existingTask.type === 'Story') {
            const story = existingTask as Story;
            if (data.sprintId !== undefined) story.sprintId = data.sprintId;
        }
        if (existingTask.type === 'Epic') {
            const epic = existingTask as Epic;
            if (data.targetDate !== undefined) epic.targetDate = data.targetDate;
        }

        return existingTask;
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
        return this.updateTask(id, {status});
    }

    getTaskStatistics(): TaskStatistics {
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
            const tasksData: unknown = JSON.parse(fileContent);
            if (!Array.isArray(tasksData)) {
                return;
            }

            this.tasks = tasksData.map((taskData: unknown) => {
                if (typeof taskData !== 'object' || taskData === null) {
                    throw new Error('Invalid task data');
                }
                const task = taskData as Record<string, unknown>;
                const id = task.id as string;
                const title = task.title as string;
                const description = task.description as string;
                const status = task.status as TaskStatus;
                const priority = task.priority as Priority;
                const createdAt = new Date(task.createdAt as string);
                const updatedAt = new Date(task.updatedAt as string);
                const assignee = task.assignee as string | undefined;
                const deadline = task.deadline as string | undefined;
                const type = task.type as string;

                return this.createTaskInstance(
                    type,
                    id,
                    title,
                    description,
                    status,
                    priority,
                    createdAt,
                    updatedAt,
                    assignee,
                    deadline,
                    task
                );
            });
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
                ...(task.type === 'Epic' && 'targetDate' in task && task.targetDate && {
                    targetDate: (task.targetDate as Date).toISOString()
                })
            }));
            const jsonContent = JSON.stringify(tasksForJson, null, 2);
            fs.writeFileSync(this.filePath, jsonContent, 'utf-8');
            return {success: true};
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

    private handleTaskOperationWithSave<T>(operation: () => T): TaskOperationResult {
        try {
            const task = operation();
            const saveResult = this.saveTasksToFile();
            if (saveResult.success) {
                return {
                    success: true,
                    task: task as TaskType
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

    createTaskWithValidation(data: CreateTaskData): TaskOperationResult {
        const existingTask = this.getTaskById(data.id || this.generateId());
        if (existingTask) {
            return {
                success: false,
                errors: [messages.taskAlreadyExists(data.id || 'unknown')]
            };
        }
        return this.handleTaskOperationWithSave(() => this.createTask(data));
    }

    updateTaskWithValidation(id: string, updates: UpdateTaskData): TaskOperationResult {
        const existingTask = this.getTaskById(id);
        if (!existingTask) {
            return {
                success: false,
                errors: [messages.taskNotFound(id)]
            };
        }
        return this.handleTaskOperationWithSave(() => this.updateTask(id, updates));
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
                return 'sprintId' in task && (task as Story).sprintId === sprintId;
            }
            return false;
        });
    }

    getEnhancedStatistics(): EnhancedTaskStatistics {
        const baseStats = this.getTaskStatistics();

        const byAssignee = this.tasks.reduce((acc, task) => {
            const assignee = task.assignee || 'Unassigned';
            acc[assignee] = (acc[assignee] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const overdue = this.getOverdueTasks().length;
        const dueSoon = this.getTasksDueSoon().length;

        return {
            total: baseStats.total,
            byStatus: baseStats.byStatus as Record<string, number>,
            byPriority: baseStats.byPriority as Record<string, number>,
            byType: baseStats.byType,
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
