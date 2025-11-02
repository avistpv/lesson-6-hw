import {TaskStatus, Priority} from '../tasks/task.types';
import {BaseTaskClass} from './base-task.model';

export class Task extends BaseTaskClass {
    public readonly type: 'Task' = 'Task';
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
        assignee?: string,
        deadline?: string,
        estimatedHours?: number,
        actualHours?: number
    ) {
        super(id, title, description, status, priority, createdAt, updatedAt, assignee, deadline);
        this.estimatedHours = estimatedHours;
        this.actualHours = actualHours;
    }

    getTaskInfo(): string {
        return `TASK DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${super.getBaseTaskInfo()}
Estimated Hours: ${this.estimatedHours || 'Not estimated'}
Actual Hours: ${this.actualHours || 'Not logged'}
Progress: ${this.estimatedHours && this.actualHours ?
            `${Math.round((this.actualHours / this.estimatedHours) * 100)}%` : 'N/A'}`;
    }

    getEstimatedHours(): number | undefined {
        return this.estimatedHours;
    }

    getActualHours(): number | undefined {
        return this.actualHours;
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

