import {TaskController} from './modules/tasks/task.controller';
import {TaskStatus, Priority, BugSeverity, TaskType} from './modules/tasks/task.types';

const taskController = new TaskController('tasks.json');
const initResult = taskController.initializeTasks();
if (initResult.success) {
    console.log(`✅ ${initResult.message}\n`);
} else {
    console.log(`❌ ${initResult.message}: ${initResult.error}\n`);
}

const taskResult = taskController.createTaskWithValidation({
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with JWT tokens',
    priority: Priority.HIGH,
    assignee: 'John Doe',
    type: 'Task',
    estimatedHours: 8,
    deadline: '2024-12-31'
});

if (taskResult.success) {
    console.log('✅ Task created with validation:', taskResult.task?.title);
} else {
    console.log('❌ Failed to create task:', taskResult.errors?.join(', '));
}

const bugResult = taskController.createTaskWithValidation({
    title: 'Login button not working',
    description: 'Users cannot click the login button on mobile devices',
    priority: Priority.CRITICAL,
    assignee: 'Jane Smith',
    type: 'Bug',
    severity: BugSeverity.HIGH,
    stepsToReproduce: [
        'Open the app on mobile',
        'Navigate to login page',
        'Try to click the login button'
    ],
    environment: 'iOS Safari 15.0',
    fixHours: 4,
    deadline: '2024-12-15'
});

if (bugResult.success) {
    console.log('✅ Bug created with validation:', bugResult.task?.title);
} else {
    console.log('❌ Failed to create bug:', bugResult.errors?.join(', '));
}

const storyResult = taskController.createTaskWithValidation({
    title: 'User profile management',
    description: 'Allow users to view and edit their profile information',
    priority: Priority.MEDIUM,
    assignee: 'Mike Johnson',
    type: 'Story',
    acceptanceCriteria: [
        'User can view their profile',
        'User can edit profile fields',
        'Changes are saved automatically',
        'Validation prevents invalid data'
    ],
    storyPoints: 5,
    sprintId: 'Sprint-1',
    deadline: '2024-12-20'
});

if (storyResult.success) {
    console.log('✅ Story created with validation:', storyResult.task?.title);
} else {
    console.log('❌ Failed to create story:', storyResult.errors?.join(', '));
}

const epicResult = taskController.createTaskWithValidation({
    title: 'E-commerce platform',
    description: 'Complete e-commerce solution with shopping cart and payments',
    priority: Priority.HIGH,
    assignee: 'Sarah Wilson',
    type: 'Epic',
    stories: [],
    targetDate: new Date('2024-12-31')
});

if (epicResult.success) {
    console.log('✅ Epic created with validation:', epicResult.task?.title);
} else {
    console.log('❌ Failed to create epic:', epicResult.errors?.join(', '));
}

let parentTaskId = '';
if (taskResult.success && taskResult.task) {
    parentTaskId = taskResult.task.id;

    const subtaskResult = taskController.createTaskWithValidation({
        title: 'Set up JWT authentication',
        description: 'Implement JWT token generation and validation middleware',
        priority: Priority.HIGH,
        assignee: 'John Doe',
        type: 'Subtask',
        parentTaskId: parentTaskId,
        estimatedHours: 4,
        deadline: '2024-12-25'
    });

    if (subtaskResult.success) {
        console.log('✅ Subtask created with validation:', subtaskResult.task?.title);
    } else {
        console.log('❌ Failed tow create subtask:', subtaskResult.errors?.join(', '));
    }
}

const statsResult = taskController.getEnhancedStatistics();
if (statsResult.success) {
    console.log('Total tasks:', statsResult.data?.total);
    console.log('By status:', statsResult.data?.byStatus);
    console.log('By type:', statsResult.data?.byType);
    console.log('By assignee:', statsResult.data?.byAssignee);
    console.log('Overdue tasks:', statsResult.data?.overdue);
    console.log('Due soon (7 days):', statsResult.data?.dueSoon);
}

const inProgressResult = taskController.filterTasks({status: TaskStatus.IN_PROGRESS});
console.log(`Tasks in progress: ${inProgressResult.count}`);
const highPriorityResult = taskController.filterTasks({priority: Priority.HIGH});
console.log(`High priority tasks: ${highPriorityResult.count}`);
const johnTasksResult = taskController.filterTasks({assignee: 'John Doe'});
console.log(`John's tasks: ${johnTasksResult.count}`);

if (taskResult.success && taskResult.task) {
    const deadlineResult = taskController.checkTaskDeadline(taskResult.task.id);
    if (deadlineResult.success) {
        console.log(`Task "${taskResult.task.title}":`);
        console.log(`  - Days until deadline: ${deadlineResult.daysUntilDeadline}`);
        console.log(`  - Is overdue: ${deadlineResult.isOverdue ? 'Yes' : 'No'}`);
        console.log(`  - Completed on time: ${deadlineResult.isCompletedOnTime ? 'Yes' : 'N/A'}`);
    }
}

const overdueResult = taskController.getOverdueTasks();
console.log(`\nOverdue tasks: ${overdueResult.success ? overdueResult.data?.length : 0}`);
const dueSoonResult = taskController.getTasksDueSoon(30);
console.log(`Tasks due in next 30 days: ${dueSoonResult.success ? dueSoonResult.data?.length : 0}`);

const searchResult = taskController.searchTasks('login');
if (searchResult.success) {
    searchResult.data?.forEach((task: TaskType) => {
        console.log(`- ${task.title} (${task.type})`);
    });
}

const allTasksResult = taskController.getAllTasks();
if (allTasksResult.success) {
    allTasksResult.data?.forEach((task: TaskType) => {
        console.log(`- ${task.title} [${task.status}] - ${task.assignee || 'Unassigned'}`);
    });
}

if (taskResult.success && taskResult.task) {
    const updateResult = taskController.updateTaskWithValidation(taskResult.task.id, {
        status: TaskStatus.IN_PROGRESS
    });
    if (updateResult.success) {
        console.log('✅ Task updated with validation');
    } else {
        console.log('❌ Failed to update task:', updateResult.errors?.join(', '));
    }
}

if (taskResult.success && taskResult.task) {
    const detailsResult = taskController.getTaskDetails(taskResult.task.id);
    if (detailsResult.success) {
        console.log(`Task details for "${detailsResult.task?.title}":`);
        console.log(`  - Status: ${detailsResult.task?.status}`);
        console.log(`  - Priority: ${detailsResult.task?.priority}`);
        console.log(`  - Created: ${detailsResult.task?.createdAt}`);
    }
}

console.log('\nEnhanced demo completed!');
console.log('Tasks have been saved to tasks.json file');