import {BaseTaskClass, BaseTaskProps} from './base-task.model';

export interface StoryProps extends BaseTaskProps {
    acceptanceCriteria: string[];
    storyPoints: number;
    sprintId?: string;
}

export class Story extends BaseTaskClass {
    public readonly type: 'Story' = 'Story';
    public acceptanceCriteria: string[];
    public storyPoints: number;
    public sprintId?: string;

    constructor(props: StoryProps) {
        super(props);
        this.acceptanceCriteria = props.acceptanceCriteria;
        this.storyPoints = props.storyPoints;
        this.sprintId = props.sprintId;
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

