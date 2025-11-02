import {TaskStatus, Priority} from '../tasks/task.types';
import {BaseTaskClass} from './base-task.model';

export class Story extends BaseTaskClass {
    public readonly type: 'Story' = 'Story';
    public acceptanceCriteria: string[];
    public storyPoints: number;
    public sprintId?: string;

    constructor(
        id: string,
        title: string,
        description: string,
        status: TaskStatus,
        priority: Priority,
        createdAt: Date,
        updatedAt: Date,
        acceptanceCriteria: string[],
        storyPoints: number,
        assignee?: string,
        deadline?: string,
        sprintId?: string
    ) {
        super(id, title, description, status, priority, createdAt, updatedAt, assignee, deadline);
        this.acceptanceCriteria = acceptanceCriteria;
        this.storyPoints = storyPoints;
        this.sprintId = sprintId;
    }

    getTaskInfo(): string {
        return `STORY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${super.getBaseTaskInfo()}
Story Points: ${this.storyPoints}
Sprint: ${this.sprintId || 'No sprint assigned'}

Acceptance Criteria:
${this.acceptanceCriteria.map((criteria: string, index: number) => `  ${index + 1}. ${criteria}`).join('\n')}`;
    }

    getAcceptanceCriteria(): string[] {
        return this.acceptanceCriteria;
    }

    getStoryPoints(): number {
        return this.storyPoints;
    }

    getSprintId(): string | undefined {
        return this.sprintId;
    }

    setAcceptanceCriteria(criteria: string[]): void {
        this.acceptanceCriteria = criteria;
        this.updatedAt = new Date();
    }

    setStoryPoints(points: number): void {
        this.storyPoints = points;
        this.updatedAt = new Date();
    }

    setSprintId(sprintId: string): void {
        this.sprintId = sprintId;
        this.updatedAt = new Date();
    }
}

