import {TaskStatus, Priority} from '../tasks/task.types';

export abstract class BaseTaskClass {
    public id: string;
    public title: string;
    public description: string;
    public status: TaskStatus;
    public priority: Priority;
    public createdAt: Date;
    public updatedAt: Date;
    public assignee?: string;
    public deadline?: string;

    constructor(
        id: string,
        title: string,
        description: string,
        status: TaskStatus,
        priority: Priority,
        createdAt: Date,
        updatedAt: Date,
        assignee?: string,
        deadline?: string
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.assignee = assignee;
        this.deadline = deadline;
    }

    protected getBaseTaskInfo(): string {
        return `Title: ${this.title}
Description: ${this.description}
Status: ${this.status}
Priority: ${this.priority}
Assignee: ${this.assignee || 'Unassigned'}
Created: ${this.createdAt.toLocaleDateString()}
Updated: ${this.updatedAt.toLocaleDateString()}
Deadline: ${this.deadline || 'No deadline set'}`;
    }

    abstract getTaskInfo(): string;

    getId(): string {
        return this.id;
    }

    getTitle(): string {
        return this.title;
    }

    getDescription(): string {
        return this.description;
    }

    getStatus(): TaskStatus {
        return this.status;
    }

    getPriority(): Priority {
        return this.priority;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }

    getAssignee(): string | undefined {
        return this.assignee;
    }

    getDeadline(): string | undefined {
        return this.deadline;
    }

    setTitle(title: string): void {
        this.title = title;
        this.updatedAt = new Date();
    }

    setDescription(description: string): void {
        this.description = description;
        this.updatedAt = new Date();
    }

    setStatus(status: TaskStatus): void {
        this.status = status;
        this.updatedAt = new Date();
    }

    setPriority(priority: Priority): void {
        this.priority = priority;
        this.updatedAt = new Date();
    }

    setAssignee(assignee: string): void {
        this.assignee = assignee;
        this.updatedAt = new Date();
    }

    setDeadline(deadline: string): void {
        this.deadline = deadline;
        this.updatedAt = new Date();
    }
}

