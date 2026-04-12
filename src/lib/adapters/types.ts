export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "done" | "cancelled" | "late";
  dueDate?: string | null;
  startDate?: string | null;
  createdAt: string;
  updatedAt?: string;
  groupId?: string | null;
  groupName?: string | null;
  assignedTo?: string[];
  assignedEmails?: string[];
  createdByUserId?: string;
  checklist?: ChecklistItem[];
  reminderEnabled?: boolean;
  reminderTime?: string | null;
  recurrence?: string;
  taskType?: string;
  createdFrom?: string;
}

export interface Group {
  id: string;
  groupName: string;
  createdBy: string;
  adminUserId: string;
  memberIds: string[];
  createdAt: string;
}

export interface GroupMember {
  id: string;
  email: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  membershipLevel: string;
  createdAt: string;
  usedTasksThisMonth: number;
  usedGroupsThisMonth: number;
  taskLimitPerMonth: number;
  groupLimitPerMonth: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  startDate?: string | null;
  groupId?: string | null;
  recurrence?: string;
  checklist?: ChecklistItem[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Task["status"];
  dueDate?: string | null;
}

export interface TaskRepository {
  getUserTasks(userId: string): Promise<Task[]>;
  getTask(userId: string, taskId: string): Promise<Task | null>;
  createTask(userId: string, data: CreateTaskInput, userEmail?: string): Promise<Task>;
  updateTask(userId: string, taskId: string, data: UpdateTaskInput): Promise<void>;
  deleteTask(userId: string, taskId: string): Promise<void>;
}

export interface GroupRepository {
  getUserGroups(userId: string): Promise<Group[]>;
  getGroup(groupId: string): Promise<Group | null>;
  getGroupMembers(groupId: string): Promise<GroupMember[]>;
  getGroupTasks(groupId: string): Promise<Task[]>;
}

export interface UserRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
}
