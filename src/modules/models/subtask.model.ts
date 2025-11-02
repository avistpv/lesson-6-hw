import {TaskStatus, Priority} from '../tasks/task.types';
import {BaseTaskClass} from './base-task.model';

export class Subtask extends BaseTaskClass {
    public readonly type: 'Subtask' = 'Subtask';
    public parentTaskId: string;
    public estimatedHours?: number;
    public actualHours?: number;

    constructor(
        id: string,
        title: string,
        description: string,
        status: TaskStatus,
        priority: Priority,
        createdAt: Date,
        updatedAt: Date,
        parentTaskId: string,
        assignee?: string,
        deadline?: string,
        estimatedHours?: number,
        actualHours?: number
    ) {
        super(id, title, description, status, priority, createdAt, updatedAt, assignee, deadline);
        this.parentTaskId = parentTaskId;
        this.estimatedHours = estimatedHours;
        this.actualHours = actualHours;
    }

    getTaskInfo(): string {
        return `SUBTASK DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${super.getBaseTaskInfo()}
Parent Task: ${this.parentTaskId}
Estimated Hours: ${this.estimatedHours || 'Not estimated'}
Actual Hours: ${this.actualHours || 'Not logged'}
Progress: ${this.estimatedHours && this.actualHours ?
            `${Math.round((this.actualHours / this.estimatedHours) * 100)}%` : 'N/A'}`;
    }

    getParentTaskId(): string {
        return this.parentTaskId;
    }

    getEstimatedHours(): number | undefined {
        return this.estimatedHours;
    }

    getActualHours(): number | undefined {
        return this.actualHours;
    }

    setParentTaskId(parentId: string): void {
        this.parentTaskId = parentId;
        this.updatedAt = new Date();
    }

    setEstimatedHours(hours: number): void {
        this.estimatedHours = hours;
        this.updatedAt = new Date();
    }

    setActualHours(hours: number): void {
        this.actualHours = hours;
        this.updatedAt = new Date();
    }
}

