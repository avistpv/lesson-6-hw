import {TaskStatus, Priority, BugSeverity} from '../tasks/task.types';
import {BaseTaskClass} from './base-task.model';

export class Bug extends BaseTaskClass {
    public readonly type: 'Bug' = 'Bug';
    public severity: BugSeverity;
    public stepsToReproduce: string[];
    public environment: string;
    public fixHours?: number;

    constructor(
        id: string,
        title: string,
        description: string,
        status: TaskStatus,
        priority: Priority,
        createdAt: Date,
        updatedAt: Date,
        severity: BugSeverity,
        stepsToReproduce: string[],
        environment: string,
        assignee?: string,
        deadline?: string,
        fixHours?: number
    ) {
        super(id, title, description, status, priority, createdAt, updatedAt, assignee, deadline);
        this.severity = severity;
        this.stepsToReproduce = stepsToReproduce;
        this.environment = environment;
        this.fixHours = fixHours;
    }

    getTaskInfo(): string {
        return `BUG DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${super.getBaseTaskInfo()}
Severity: ${this.severity}
Environment: ${this.environment}
Fix Hours: ${this.fixHours || 'Not estimated'}

Steps to Reproduce:
${this.stepsToReproduce.map((step: string, index: number) => `  ${index + 1}. ${step}`).join('\n')}`;
    }

    getSeverity(): BugSeverity {
        return this.severity;
    }

    getStepsToReproduce(): string[] {
        return this.stepsToReproduce;
    }

    getEnvironment(): string {
        return this.environment;
    }

    getFixHours(): number | undefined {
        return this.fixHours;
    }

    setSeverity(severity: BugSeverity): void {
        this.severity = severity;
        this.updatedAt = new Date();
    }

    setStepsToReproduce(steps: string[]): void {
        this.stepsToReproduce = steps;
        this.updatedAt = new Date();
    }

    setEnvironment(environment: string): void {
        this.environment = environment;
        this.updatedAt = new Date();
    }

    setFixHours(hours: number): void {
        this.fixHours = hours;
        this.updatedAt = new Date();
    }
}

