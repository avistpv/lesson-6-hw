export interface BaseTask {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    createdAt: Date;
    updatedAt: Date;
    assignee?: string;
    deadline?: string;
}

export interface TaskInterface extends BaseTask {
    type: 'Task';
    estimatedHours?: number;
    actualHours?: number;
}

export interface SubtaskInterface extends BaseTask {
    type: 'Subtask';
    parentTaskId: string;
    estimatedHours?: number;
    actualHours?: number;
}

export interface BugInterface extends BaseTask {
    type: 'Bug';
    severity: BugSeverity;
    stepsToReproduce: string[];
    environment: string;
    fixHours?: number;
}

export interface StoryInterface extends BaseTask {
    type: 'Story';
    acceptanceCriteria: string[];
    storyPoints: number;
    sprintId?: string;
}

export interface EpicInterface extends BaseTask {
    type: 'Epic';
    stories: string[];
    targetDate?: Date;
}

export type TaskType = TaskInterface | SubtaskInterface | BugInterface | StoryInterface | EpicInterface;

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED'
}

export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum BugSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export type BaseTaskInputFields = Pick<BaseTask, 'title' | 'description' | 'priority' | 'assignee' | 'deadline'>;

type TaskCreationExtensions = {
    type: 'Task' | 'Subtask' | 'Bug' | 'Story' | 'Epic';
    parentTaskId?: string;
    estimatedHours?: number;
    actualHours?: number;
    severity?: BugSeverity;
    stepsToReproduce?: string[];
    environment?: string;
    acceptanceCriteria?: string[];
    storyPoints?: number;
    sprintId?: string;
    targetDate?: Date;
    stories?: string[];
    fixHours?: number;
};

type TaskUpdateExtensions = {
    estimatedHours?: number;
    actualHours?: number;
    fixHours?: number;
    sprintId?: string;
    targetDate?: Date;
};

export type CreateTaskData = Partial<Pick<BaseTask, 'id'>> & BaseTaskInputFields & TaskCreationExtensions;

export type UpdateTaskData = Partial<BaseTaskInputFields> & Partial<Pick<BaseTask, 'status'>> & TaskUpdateExtensions;

export interface TaskOperationResult {
    success: boolean;
    task?: TaskType;
    errors?: string[];
    error?: string;
}

export type TaskDetailsResult = Omit<TaskOperationResult, 'errors'>;

export interface TaskDeleteResult {
    success: boolean;
    message?: string;
    error?: string;
}

export interface TaskFilterResult {
    success: boolean;
    tasks: TaskType[];
    count: number;
}

export interface TaskDeadlineResult {
    success: boolean;
    task?: TaskType;
    isCompletedOnTime?: boolean;
    daysUntilDeadline?: number;
    isOverdue?: boolean;
    error?: string;
}

export interface TaskFilters {
    status?: TaskStatus;
    priority?: Priority;
    createdAfter?: string;
    createdBefore?: string;
    deadlineAfter?: string;
    deadlineBefore?: string;
    assignee?: string;
    type?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface TaskStatistics {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
}

export interface EnhancedTaskStatistics extends TaskStatistics {
    byAssignee: Record<string, number>;
    overdue: number;
    dueSoon: number;
}

export const defaultStatus = "TODO" as const;
export const defaultPriority = "MEDIUM" as const;
export const taskTitleMinLength = 5;
export const taskTitleMaxLength = 100;
export const taskDescriptionMinLength = 10;
export const taskDescriptionMaxLength = 1000;

export const messages = {
    taskNotFound: (id: number | string) => `Task with ID ${id} not found`,
    taskAlreadyExists: (id: number | string) => `Task with ID ${id} already exists`,
    taskDeletedSuccess: (title: string, id: number | string) => `Task "${title}" (ID: ${id}) successfully deleted`,
    unknownError: "Unknown error",
    taskCreatedSuccess: (title: string, id: number | string) => `Task "${title}" (ID: ${id}) successfully created`,
    taskUpdatedSuccess: (title: string, id: number | string) => `Task "${title}" (ID: ${id}) successfully updated`
} as const;