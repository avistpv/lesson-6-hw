import {TaskStatus, Priority} from '../tasks/task.types';
import {BaseTaskClass} from './base-task.model';

export class Epic extends BaseTaskClass {
    public readonly type: 'Epic' = 'Epic';
    public stories: string[];
    public targetDate?: Date;

    constructor(
        id: string,
        title: string,
        description: string,
        status: TaskStatus,
        priority: Priority,
        createdAt: Date,
        updatedAt: Date,
        stories: string[],
        assignee?: string,
        deadline?: string,
        targetDate?: Date
    ) {
        super(id, title, description, status, priority, createdAt, updatedAt, assignee, deadline);
        this.stories = stories;
        this.targetDate = targetDate;
    }

    getTaskInfo(): string {
        return `EPIC DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${super.getBaseTaskInfo()}
Target Date: ${this.targetDate ? this.targetDate.toLocaleDateString() : 'No target date set'}
Stories Count: ${this.stories.length}

Associated Stories:
${this.stories.length > 0 ?
            this.stories.map((story: string, index: number) => `  ${index + 1}. ${story}`).join('\n') :
            '  No stories assigned yet'}`;
    }

    getStories(): string[] {
        return this.stories;
    }

    getTargetDate(): Date | undefined {
        return this.targetDate;
    }

    addStory(storyId: string): void {
        if (!this.stories.includes(storyId)) {
            this.stories.push(storyId);
            this.updatedAt = new Date();
        }
    }

    removeStory(storyId: string): void {
        this.stories = this.stories.filter(id => id !== storyId);
        this.updatedAt = new Date();
    }

    setTargetDate(date: Date): void {
        this.targetDate = date;
        this.updatedAt = new Date();
    }
}

