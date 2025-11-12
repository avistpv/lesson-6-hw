import {
    CreateTaskData,
    UpdateTaskData,
    TaskStatus,
    Priority,
    BugSeverity,
    taskTitleMinLength,
    taskTitleMaxLength,
    taskDescriptionMinLength,
    taskDescriptionMaxLength
} from './task.types';

export interface ValidationResult {
    success: boolean;
    errors: string[];
}

export function validateTitle(title: unknown, required: boolean, errors: string[]): void {
    if (required) {
        if (!title || typeof title !== 'string') {
            errors.push('Title is required and must be a string');
            return;
        }
        const trimmed = title.trim();
        if (trimmed.length === 0) {
            errors.push('Title cannot be empty');
        } else if (trimmed.length < taskTitleMinLength) {
            errors.push(`Title must be at least ${taskTitleMinLength} characters long`);
        } else if (trimmed.length > taskTitleMaxLength) {
            errors.push(`Title must be no more than ${taskTitleMaxLength} characters long`);
        }
    } else {
        if (title !== undefined) {
            if (typeof title !== 'string') {
                errors.push('Title must be a string');
            } else {
                const trimmed = title.trim();
                if (trimmed.length === 0) {
                    errors.push('Title cannot be empty');
                } else if (trimmed.length < taskTitleMinLength) {
                    errors.push(`Title must be at least ${taskTitleMinLength} characters long`);
                } else if (trimmed.length > taskTitleMaxLength) {
                    errors.push(`Title must be no more than ${taskTitleMaxLength} characters long`);
                }
            }
        }
    }
}

export function validateDescription(description: unknown, required: boolean, errors: string[]): void {
    if (required) {
        if (!description || typeof description !== 'string') {
            errors.push('Description is required and must be a string');
            return;
        }
        const trimmed = description.trim();
        if (trimmed.length === 0) {
            errors.push('Description cannot be empty');
        } else if (trimmed.length < taskDescriptionMinLength) {
            errors.push(`Description must be at least ${taskDescriptionMinLength} characters long`);
        } else if (trimmed.length > taskDescriptionMaxLength) {
            errors.push(`Description must be no more than ${taskDescriptionMaxLength} characters long`);
        }
    } else {
        if (description !== undefined) {
            if (typeof description !== 'string') {
                errors.push('Description must be a string');
            } else {
                const trimmed = description.trim();
                if (trimmed.length === 0) {
                    errors.push('Description cannot be empty');
                } else if (trimmed.length < taskDescriptionMinLength) {
                    errors.push(`Description must be at least ${taskDescriptionMinLength} characters long`);
                } else if (trimmed.length > taskDescriptionMaxLength) {
                    errors.push(`Description must be no more than ${taskDescriptionMaxLength} characters long`);
                }
            }
        }
    }
}

export function validatePriority(priority: unknown, required: boolean, errors: string[]): void {
    const validPriorities = Object.values(Priority);
    if (required) {
        if (!priority || !validPriorities.includes(priority as Priority)) {
            errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
        }
    } else {
        if (priority !== undefined && !validPriorities.includes(priority as Priority)) {
            errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
        }
    }
}

export function validateStatus(status: unknown, errors: string[]): void {
    if (status !== undefined) {
        const validStatuses = Object.values(TaskStatus);
        if (!validStatuses.includes(status as TaskStatus)) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }
    }
}

export function validateAssignee(assignee: unknown, errors: string[]): void {
    if (assignee !== undefined && assignee !== null) {
        if (typeof assignee !== 'string') {
            errors.push('Assignee must be a string');
        } else if (assignee.trim().length === 0) {
            errors.push('Assignee cannot be an empty string');
        }
    }
}

export function validateDeadline(deadline: unknown, errors: string[]): void {
    if (deadline !== undefined && deadline !== null) {
        if (typeof deadline !== 'string') {
            errors.push('Deadline must be a string');
        } else if (deadline.trim().length === 0) {
            errors.push('Deadline cannot be an empty string');
        } else if (isNaN(Date.parse(deadline))) {
            errors.push('Deadline must be a valid date string');
        }
    }
}

interface SharedValidationOptions {
    requireTitle: boolean;
    requireDescription: boolean;
    requirePriority: boolean;
    includeStoryPoints?: boolean;
}

function validateSharedTaskFields(
    data: Partial<CreateTaskData> | Partial<UpdateTaskData>,
    errors: string[],
    options: SharedValidationOptions
): void {
    validateTitle(data.title, options.requireTitle, errors);
    validateDescription(data.description, options.requireDescription, errors);
    validatePriority(data.priority, options.requirePriority, errors);
    validateAssignee(data.assignee, errors);
    validateDeadline(data.deadline, errors);
    validateNumericField(data.estimatedHours, 'Estimated hours', errors);
    validateNumericField(data.actualHours, 'Actual hours', errors);
    validateNumericField(data.fixHours, 'Fix hours', errors);

    if (options.includeStoryPoints) {
        validateNumericField((data as Partial<CreateTaskData>).storyPoints, 'Story points', errors);
    }
}

export function validateNumericField(value: unknown, fieldName: string, errors: string[]): void {
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

export function validateTypeSpecificFields(data: Partial<CreateTaskData> & { type: string }, errors: string[]): void {
    switch (data.type) {
        case 'Subtask':
            if (!data.parentTaskId || typeof data.parentTaskId !== 'string') {
                errors.push('Parent task ID is required for subtasks');
            } else if (data.parentTaskId.trim().length === 0) {
                errors.push('Parent task ID cannot be empty');
            }
            break;

        case 'Bug':
            const validSeverities = Object.values(BugSeverity);
            if (!data.severity || !validSeverities.includes(data.severity)) {
                errors.push(`Severity is required for bugs and must be one of: ${validSeverities.join(', ')}`);
            }
            if (!data.stepsToReproduce || !Array.isArray(data.stepsToReproduce)) {
                errors.push('Steps to reproduce is required for bugs and must be an array');
            } else if (data.stepsToReproduce.length === 0) {
                errors.push('Steps to reproduce cannot be empty for bugs');
            } else {
                data.stepsToReproduce.forEach((step: string, index: number) => {
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
                data.acceptanceCriteria.forEach((criteria: string, index: number) => {
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
                    data.stories.forEach((story: string, index: number) => {
                        if (typeof story !== 'string' || story.trim().length === 0) {
                            errors.push(`Story ${index + 1} must be a non-empty string`);
                        }
                    });
                }
            }
            break;
    }
}

export function validateTaskType(type: unknown, errors: string[]): void {
    const validTypes = ['Task', 'Subtask', 'Bug', 'Story', 'Epic'];
    if (!type || !validTypes.includes(type as string)) {
        errors.push(`Type must be one of: ${validTypes.join(', ')}`);
    }
}

export function validateCreateTaskData(data: Partial<CreateTaskData> & {
    type: string;
    priority: string
}): ValidationResult {
    const errors: string[] = [];

    validateSharedTaskFields(data, errors, {
        requireTitle: true,
        requireDescription: true,
        requirePriority: true,
        includeStoryPoints: true
    });
    validateTaskType(data.type, errors);
    validateTypeSpecificFields(data, errors);

    return {
        success: errors.length === 0,
        errors
    };
}

export function validateUpdateTaskData(data: Partial<UpdateTaskData>): ValidationResult {
    const errors: string[] = [];

    validateSharedTaskFields(data, errors, {
        requireTitle: false,
        requireDescription: false,
        requirePriority: false
    });
    validateStatus(data.status, errors);

    return {
        success: errors.length === 0,
        errors
    };
}

