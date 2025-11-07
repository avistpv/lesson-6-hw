import {
    TaskType,
    CreateTaskData,
    UpdateTaskData,
    TaskStatus,
    Priority,
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
import {BaseTaskProps} from '../models/base-task.model';

type TaskCreationPayload = CreateTaskData & {
    status?: TaskStatus;
    createdAt?: Date;
    updatedAt?: Date;
};

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

    private countTasksBy<K extends string>(selector: (task: TaskType) => K): Record<K, number> {
        return this.tasks.reduce((acc, task) => {
            const key = selector(task);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<K, number>);
    }

    private createTaskInstance(taskData: TaskCreationPayload): TaskType {
        const baseProps: BaseTaskProps = {
            id: taskData.id,
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            priority: taskData.priority,
            createdAt: taskData.createdAt,
            updatedAt: taskData.updatedAt,
            assignee: taskData.assignee,
            deadline: taskData.deadline
        };

        switch (taskData.type) {
            case 'Task':
                return new Task({
                    ...baseProps,
                    estimatedHours: taskData.estimatedHours,
                    actualHours: taskData.actualHours
                });
            case 'Subtask':
                if (!taskData.parentTaskId) {
                    throw new Error('Parent task ID is required for subtasks');
                }
                return new Subtask({
                    ...baseProps,
                    parentTaskId: taskData.parentTaskId,
                    estimatedHours: taskData.estimatedHours,
                    actualHours: taskData.actualHours
                });
            case 'Bug':
                if (!taskData.severity) {
                    throw new Error('Severity is required for bugs');
                }
                if (!taskData.stepsToReproduce || taskData.stepsToReproduce.length === 0) {
                    throw new Error('Steps to reproduce are required for bugs');
                }
                if (!taskData.environment || taskData.environment.trim().length === 0) {
                    throw new Error('Environment is required for bugs');
                }
                return new Bug({
                    ...baseProps,
                    severity: taskData.severity,
                    stepsToReproduce: taskData.stepsToReproduce,
                    environment: taskData.environment.trim(),
                    fixHours: taskData.fixHours
                });
            case 'Story':
                if (!taskData.acceptanceCriteria || taskData.acceptanceCriteria.length === 0) {
                    throw new Error('Acceptance criteria are required for stories');
                }
                if (taskData.storyPoints === undefined || taskData.storyPoints < 0) {
                    throw new Error('Story points are required for stories');
                }
                return new Story({
                    ...baseProps,
                    acceptanceCriteria: taskData.acceptanceCriteria,
                    storyPoints: taskData.storyPoints,
                    sprintId: taskData.sprintId
                });
            case 'Epic':
                return new Epic({
                    ...baseProps,
                    stories: taskData.stories || [],
                    targetDate: taskData.targetDate
                });
            default:
                throw new Error(`Invalid task type: ${taskData.type}`);
        }
    }

    private normalizeTaskDataFromFile(task: Record<string, unknown>): TaskCreationPayload {
        const typeValue = task.type;
        if (typeof typeValue !== 'string') {
            throw new Error('Task type must be a string');
        }

        const priorityValue = task.priority;
        if (typeof priorityValue !== 'string') {
            throw new Error('Task priority must be a string');
        }

        const parseDate = (value: unknown): Date | undefined => {
            if (value instanceof Date) {
                return value;
            }
            if (typeof value === 'string') {
                const parsed = new Date(value);
                if (!Number.isNaN(parsed.getTime())) {
                    return parsed;
                }
            }
            return undefined;
        };

        const pickStringArray = (value: unknown): string[] | undefined => {
            if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
                return value as string[];
            }
            return undefined;
        };

        const pickString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);
        const pickNumber = (value: unknown): number | undefined => (typeof value === 'number' ? value : undefined);

        const titleInput = pickString(task.title);
        const descriptionInput = pickString(task.description);
        const assigneeInput = pickString(task.assignee);
        const deadlineInput = pickString(task.deadline);
        const estimatedHoursInput = pickNumber(task.estimatedHours);
        const actualHoursInput = pickNumber(task.actualHours);
        const parentTaskIdInput = pickString(task.parentTaskId);
        const severityInput = pickString(task.severity) as CreateTaskData['severity'];
        const stepsToReproduceInput = pickStringArray(task.stepsToReproduce);
        const environmentInput = pickString(task.environment);
        const fixHoursInput = pickNumber(task.fixHours);
        const acceptanceCriteriaInput = pickStringArray(task.acceptanceCriteria);
        const storyPointsInput = pickNumber(task.storyPoints);
        const sprintIdInput = pickString(task.sprintId);
        const storiesInput = pickStringArray(task.stories);
        const targetDateInput = parseDate(task.targetDate);

        const allowedTypes: ReadonlyArray<CreateTaskData['type']> = ['Task', 'Subtask', 'Bug', 'Story', 'Epic'];
        const isTaskType = (value: string): value is CreateTaskData['type'] =>
            allowedTypes.includes(value as CreateTaskData['type']);
        if (!isTaskType(typeValue)) {
            throw new Error(`Unsupported task type: ${typeValue}`);
        }

        const isPriority = (value: string): value is Priority =>
            Object.values(Priority).includes(value as Priority);
        if (!isPriority(priorityValue)) {
            throw new Error(`Unsupported task priority: ${priorityValue}`);
        }

        const normalizedType: CreateTaskData['type'] = typeValue;
        const normalizedPriority: Priority = priorityValue as Priority;

        const validation = validateCreateTaskData({
            type: normalizedType,
            priority: normalizedPriority,
            title: titleInput,
            description: descriptionInput,
            assignee: assigneeInput,
            deadline: deadlineInput,
            estimatedHours: estimatedHoursInput,
            actualHours: actualHoursInput,
            parentTaskId: parentTaskIdInput,
            severity: severityInput,
            stepsToReproduce: stepsToReproduceInput,
            environment: environmentInput,
            fixHours: fixHoursInput,
            acceptanceCriteria: acceptanceCriteriaInput,
            storyPoints: storyPointsInput,
            sprintId: sprintIdInput,
            stories: storiesInput,
            targetDate: targetDateInput
        });

        if (!validation.success) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        if (!titleInput || !descriptionInput) {
            throw new Error('Title and description must be provided');
        }

        return {
            id: pickString(task.id),
            type: normalizedType,
            priority: normalizedPriority,
            title: titleInput.trim(),
            description: descriptionInput.trim(),
            assignee: assigneeInput,
            deadline: deadlineInput,
            estimatedHours: estimatedHoursInput,
            actualHours: actualHoursInput,
            parentTaskId: parentTaskIdInput,
            severity: severityInput,
            stepsToReproduce: stepsToReproduceInput,
            environment: environmentInput,
            fixHours: fixHoursInput,
            acceptanceCriteria: acceptanceCriteriaInput,
            storyPoints: storyPointsInput,
            sprintId: sprintIdInput,
            stories: storiesInput,
            targetDate: targetDateInput,
            status: typeof task.status === 'string' && Object.values(TaskStatus).includes(task.status as TaskStatus)
                ? (task.status as TaskStatus)
                : undefined,
            createdAt: parseDate(task.createdAt),
            updatedAt: parseDate(task.updatedAt)
        };
    }

    createTask(data: CreateTaskData): TaskType {
        this.validateTaskData(data);

        if (data.type === 'Subtask') {
            if (!data.parentTaskId) {
                throw new Error('Parent task ID is required for subtasks');
            }
            if (!this.getTaskById(data.parentTaskId)) {
                throw new Error('Parent task not found');
            }
        }

        const normalizedData: TaskCreationPayload = {
            ...data,
            title: data.title.trim(),
            description: data.description.trim()
        };

        const task = this.createTaskInstance(normalizedData);

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
        return this.tasks.filter((task): task is Subtask =>
            task.type === 'Subtask' && task.parentTaskId === parentId
        );
    }

    getStoriesBySprintId(sprintId: string): Story[] {
        return this.tasks.filter((task): task is Story =>
            task.type === 'Story' && task.sprintId === sprintId
        );
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

        switch (existingTask.type) {
            case 'Task':
            case 'Subtask':
                if (data.estimatedHours !== undefined) existingTask.estimatedHours = data.estimatedHours;
                if (data.actualHours !== undefined) existingTask.actualHours = data.actualHours;
                break;
            case 'Bug':
                if (data.fixHours !== undefined) existingTask.fixHours = data.fixHours;
                break;
            case 'Story':
                if (data.sprintId !== undefined) existingTask.sprintId = data.sprintId;
                break;
            case 'Epic':
                if (data.targetDate !== undefined) existingTask.targetDate = data.targetDate;
                break;
            default:
                break;
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
        const byStatus = this.countTasksBy(task => task.status);
        const byPriority = this.countTasksBy(task => task.priority);
        const byType = this.countTasksBy(task => task.type);

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

            const loadedTasks: TaskType[] = [];

            tasksData.forEach((taskData: unknown, index: number) => {
                try {
                    if (typeof taskData !== 'object' || taskData === null) {
                        throw new Error('Invalid task data');
                    }

                    const normalizedTask = this.normalizeTaskDataFromFile(taskData as Record<string, unknown>);
                    loadedTasks.push(this.createTaskInstance(normalizedTask));
                } catch (error) {
                    console.error(`Error loading task at index ${index}:`, error);
                }
            });

            this.tasks = loadedTasks;
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
                ...(task.type === 'Epic' && task.targetDate && {
                    targetDate: task.targetDate.toISOString()
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
        if (data.id) {
            const existingTask = this.getTaskById(data.id);
            if (existingTask) {
                return {
                    success: false,
                    errors: [messages.taskAlreadyExists(data.id)]
                };
            }
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
        return this.tasks.filter(task =>
            task.type === 'Story' && task.sprintId === sprintId
        );
    }

    getEnhancedStatistics(): EnhancedTaskStatistics {
        const baseStats = this.getTaskStatistics();

        const byAssignee = this.countTasksBy(task => task.assignee || 'Unassigned');

        const overdue = this.getOverdueTasks().length;
        const dueSoon = this.getTasksDueSoon().length;

        return {
            ...baseStats,
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
