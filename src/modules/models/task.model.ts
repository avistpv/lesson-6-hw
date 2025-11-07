import {BaseTaskClass, BaseTaskProps} from './base-task.model';

export interface TaskProps extends BaseTaskProps {
    estimatedHours?: number;
    actualHours?: number;
}

export class Task extends BaseTaskClass {
    public readonly type: 'Task' = 'Task';
    public estimatedHours?: number;
    public actualHours?: number;

    constructor(props: TaskProps) {
        super(props);
        this.estimatedHours = props.estimatedHours;
        this.actualHours = props.actualHours;
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

