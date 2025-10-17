export interface BaseTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  assignee?: string;
  deadline?: string;
}

export interface TaskInterface extends BaseTask {
  type: 'Task';
  estimatedHours?: number;
  actualHours?: number;
}

export interface SubtaskInterface extends BaseTask {
  type: 'Subtask';
  parentTaskId: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface BugInterface extends BaseTask {
  type: 'Bug';
  severity: BugSeverity;
  stepsToReproduce: string[];
  environment: string;
  fixHours?: number;
}

export interface StoryInterface extends BaseTask {
  type: 'Story';
  acceptanceCriteria: string[];
  storyPoints: number;
  sprintId?: string;
}

export interface EpicInterface extends BaseTask {
  type: 'Epic';
  stories: string[];
  targetDate?: Date;
}

export type TaskType = TaskInterface | SubtaskInterface | BugInterface | StoryInterface | EpicInterface;

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum BugSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface CreateTaskData {
  id?: string;
  title: string;
  description: string;
  priority: Priority;
  assignee?: string;
  type: 'Task' | 'Subtask' | 'Bug' | 'Story' | 'Epic';
  parentTaskId?: string;
  estimatedHours?: number;
  actualHours?: number;
  severity?: BugSeverity;
  stepsToReproduce?: string[];
  environment?: string;
  acceptanceCriteria?: string[];
  storyPoints?: number;
  sprintId?: string;
  targetDate?: Date;
  stories?: string[];
  fixHours?: number;
  deadline?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
  fixHours?: number;
  sprintId?: string;
  targetDate?: Date;
  deadline?: string;
}

export interface TaskOperationResult {
  success: boolean;
  task?: TaskType;
  errors?: string[];
  error?: string;
}

export interface TaskDetailsResult {
  success: boolean;
  task?: TaskType;
  error?: string;
}

export interface TaskDeleteResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TaskFilterResult {
  success: boolean;
  tasks: TaskType[];
  count: number;
}

export interface TaskDeadlineResult {
  success: boolean;
  task?: TaskType;
  isCompletedOnTime?: boolean;
  daysUntilDeadline?: number;
  isOverdue?: boolean;
  error?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  createdAfter?: string;
  createdBefore?: string;
  deadlineAfter?: string;
  deadlineBefore?: string;
  assignee?: string;
  type?: string;
}

export const defaultStatus = "TODO" as const;
export const defaultPriority = "MEDIUM" as const;
export const taskTitleMinLength = 5;
export const taskTitleMaxLength = 100;
export const taskDescriptionMinLength = 10;
export const taskDescriptionMaxLength = 1000;

export const messages = {
    taskNotFound: (id: number | string) => `Task with ID ${id} not found`,
    taskAlreadyExists: (id: number | string) => `Task with ID ${id} already exists`,
    taskDeletedSuccess: (title: string, id: number | string) => `Task "${title}" (ID: ${id}) successfully deleted`,
    unknownError: "Unknown error",
    taskCreatedSuccess: (title: string, id: number | string) => `Task "${title}" (ID: ${id}) successfully created`,
    taskUpdatedSuccess: (title: string, id: number | string) => `Task "${title}" (ID: ${id}) successfully updated`
} as const;

export abstract class BaseTaskClass {
  protected id: string;
  protected title: string;
  protected description: string;
  protected status: TaskStatus;
  protected priority: Priority;
  protected createdAt: Date;
  protected updatedAt: Date;
  protected assignee?: string;
  protected deadline?: string;

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

  abstract getTaskInfo(): string;
  getId(): string { return this.id; }
  getTitle(): string { return this.title; }
  getDescription(): string { return this.description; }
  getStatus(): TaskStatus { return this.status; }
  getPriority(): Priority { return this.priority; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
  getAssignee(): string | undefined { return this.assignee; }
  getDeadline(): string | undefined { return this.deadline; }

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

export class Task extends BaseTaskClass {
  private estimatedHours?: number;
  private actualHours?: number;

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
Title: ${this.title}
Description: ${this.description}
Status: ${this.status}
Priority: ${this.priority}
Assignee: ${this.assignee || 'Unassigned'}
Created: ${this.createdAt.toLocaleDateString()}
Updated: ${this.updatedAt.toLocaleDateString()}
Deadline: ${this.deadline || 'No deadline set'}
Estimated Hours: ${this.estimatedHours || 'Not estimated'}
Actual Hours: ${this.actualHours || 'Not logged'}
Progress: ${this.estimatedHours && this.actualHours ? 
  `${Math.round((this.actualHours / this.estimatedHours) * 100)}%` : 'N/A'}`;
  }

  getEstimatedHours(): number | undefined { return this.estimatedHours; }
  getActualHours(): number | undefined { return this.actualHours; }
  setEstimatedHours(hours: number): void { 
    this.estimatedHours = hours; 
    this.updatedAt = new Date();
  }
  setActualHours(hours: number): void { 
    this.actualHours = hours; 
    this.updatedAt = new Date();
  }
}

export class Subtask extends BaseTaskClass {
  private parentTaskId: string;
  private estimatedHours?: number;
  private actualHours?: number;

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
Title: ${this.title}
Description: ${this.description}
Parent Task: ${this.parentTaskId}
Status: ${this.status}
Priority: ${this.priority}
Assignee: ${this.assignee || 'Unassigned'}
Created: ${this.createdAt.toLocaleDateString()}
Updated: ${this.updatedAt.toLocaleDateString()}
Deadline: ${this.deadline || 'No deadline set'}
Estimated Hours: ${this.estimatedHours || 'Not estimated'}
Actual Hours: ${this.actualHours || 'Not logged'}
Progress: ${this.estimatedHours && this.actualHours ? 
  `${Math.round((this.actualHours / this.estimatedHours) * 100)}%` : 'N/A'}`;
  }
  getParentTaskId(): string { return this.parentTaskId; }
  getEstimatedHours(): number | undefined { return this.estimatedHours; }
  getActualHours(): number | undefined { return this.actualHours; }
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

export class Bug extends BaseTaskClass {
  private severity: BugSeverity;
  private stepsToReproduce: string[];
  private environment: string;
  private fixHours?: number;

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
Title: ${this.title}
Description: ${this.description}
Severity: ${this.severity}
Environment: ${this.environment}
Status: ${this.status}
Priority: ${this.priority}
Assignee: ${this.assignee || 'Unassigned'}
Created: ${this.createdAt.toLocaleDateString()}
Updated: ${this.updatedAt.toLocaleDateString()}
Deadline: ${this.deadline || 'No deadline set'}
Fix Hours: ${this.fixHours || 'Not estimated'}

Steps to Reproduce:
${this.stepsToReproduce.map((step, index) => `  ${index + 1}. ${step}`).join('\n')}`;
  }
  getSeverity(): BugSeverity { return this.severity; }
  getStepsToReproduce(): string[] { return this.stepsToReproduce; }
  getEnvironment(): string { return this.environment; }
  getFixHours(): number | undefined { return this.fixHours; }
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

export class Story extends BaseTaskClass {
  private acceptanceCriteria: string[];
  private storyPoints: number;
  private sprintId?: string;

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
Title: ${this.title}
Description: ${this.description}
Story Points: ${this.storyPoints}
Sprint: ${this.sprintId || 'No sprint assigned'}
Status: ${this.status}
Priority: ${this.priority}
Assignee: ${this.assignee || 'Unassigned'}
Created: ${this.createdAt.toLocaleDateString()}
Updated: ${this.updatedAt.toLocaleDateString()}
Deadline: ${this.deadline || 'No deadline set'}

Acceptance Criteria:
${this.acceptanceCriteria.map((criteria, index) => `  ${index + 1}. ${criteria}`).join('\n')}`;
  }

  getAcceptanceCriteria(): string[] { return this.acceptanceCriteria; }
  getStoryPoints(): number { return this.storyPoints; }
  getSprintId(): string | undefined { return this.sprintId; }
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

export class Epic extends BaseTaskClass {
  private stories: string[];
  private targetDate?: Date;

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
Title: ${this.title}
Description: ${this.description}
Status: ${this.status}
Priority: ${this.priority}
Assignee: ${this.assignee || 'Unassigned'}
Created: ${this.createdAt.toLocaleDateString()}
Updated: ${this.updatedAt.toLocaleDateString()}
Deadline: ${this.deadline || 'No deadline set'}
Target Date: ${this.targetDate ? this.targetDate.toLocaleDateString() : 'No target date set'}
Stories Count: ${this.stories.length}

Associated Stories:
${this.stories.length > 0 ? 
  this.stories.map((story, index) => `  ${index + 1}. ${story}`).join('\n') : 
  '  No stories assigned yet'}`;
  }

  getStories(): string[] { return this.stories; }
  getTargetDate(): Date | undefined { return this.targetDate; }
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

export type TaskClass = Task | Subtask | Bug | Story | Epic;