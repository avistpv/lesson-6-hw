export {BaseTaskClass} from './base-task.model';
export {Task} from './task.model';
export {Subtask} from './subtask.model';
export {Bug} from './bug.model';
export {Story} from './story.model';
export {Epic} from './epic.model';

import {Task} from './task.model';
import {Subtask} from './subtask.model';
import {Bug} from './bug.model';
import {Story} from './story.model';
import {Epic} from './epic.model';

export type TaskClass = Task | Subtask | Bug | Story | Epic;

