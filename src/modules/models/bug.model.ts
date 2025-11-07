import {BugSeverity} from '../tasks/task.types';
import {BaseTaskClass, BaseTaskProps} from './base-task.model';

export interface BugProps extends BaseTaskProps {
    severity: BugSeverity;
    stepsToReproduce: string[];
    environment: string;
    fixHours?: number;
}

export class Bug extends BaseTaskClass {
    public readonly type: 'Bug' = 'Bug';
    public severity: BugSeverity;
    public stepsToReproduce: string[];
    public environment: string;
    public fixHours?: number;

    constructor(props: BugProps) {
        super(props);
        this.severity = props.severity;
        this.stepsToReproduce = props.stepsToReproduce;
        this.environment = props.environment;
        this.fixHours = props.fixHours;
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

