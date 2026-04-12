import { db } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type {
  Task,
  Group,
  GroupMember,
  UserProfile,
  CreateTaskInput,
  UpdateTaskInput,
  TaskRepository,
  GroupRepository,
  UserRepository,
} from "../types";

function toISO(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val.toDate) return val.toDate().toISOString();
  return new Date(val).toISOString();
}

function mapTask(d: any, userId: string): Task {
  const data = d.data() || {};
  return {
    id: d.id,
    title: data.taskName || data.title || "",
    description: data.taskDescription || data.description || "",
    status: data.status || "pending",
    dueDate: data.endDate ? toISO(data.endDate) : data.dueDate ? toISO(data.dueDate) : null,
    startDate: data.startDate ? toISO(data.startDate) : null,
    createdAt: toISO(data.createdAt),
    updatedAt: data.lastModified ? toISO(data.lastModified) : undefined,
    groupId: data.groupId || null,
    groupName: data.groupName || null,
    assignedTo: data.assignedTo || [],
    assignedEmails: data.assignedEmails || [],
    createdByUserId: data.createdByUserId || userId,
    checklist: data.checklist || [],
    reminderEnabled: data.reminderEnabled || false,
    reminderTime: data.reminderTime ? toISO(data.reminderTime) : null,
    recurrence: data.recurrence || "none",
    taskType: data.taskType || "personal",
    createdFrom: data.createdFrom || "mobile",
  };
}

// ── Tasks ──

export const taskRepo: TaskRepository = {
  async getUserTasks(userId) {
    const snap = await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .orderBy("createdAt", "desc")
      .get();

    return snap.docs.map((d) => mapTask(d, userId));
  },

  async getTask(userId, taskId) {
    const doc = await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .doc(taskId)
      .get();

    if (!doc.exists) return null;
    return mapTask(doc, userId);
  },

  async createTask(userId, data, userEmail?: string) {
    // Use mobile app field names for full compatibility
    const nowMs = Date.now();
    const taskData: Record<string, any> = {
      taskName: data.title,
      taskDescription: data.description || "",
      status: "pending",
      taskType: "personal",
      createdAt: FieldValue.serverTimestamp(),
      createdAtTimestamp: nowMs,
      lastModified: FieldValue.serverTimestamp(),
      createdByUserId: userId,
      createdBy_userEmail: userEmail || "",
      assignedTo: [userId],
      assignedEmails: userEmail ? [userEmail] : [],
      groupId: data.groupId || null,
      editCount: 0,
      recurrence: data.recurrence && data.recurrence !== "none" ? data.recurrence : "none",
      checklist: data.checklist && data.checklist.length > 0 ? data.checklist : [],
      reminderEnabled: false,
      reminderTime: null,
      reminderOneHourSent: false,
      reminderOneHourStartSent: false,
      _loadedFromTemplate: false,
      _templateId: null,
      _usedQuickDate: null,
      createdFrom: "web",
    };

    // Dates
    if (data.dueDate) {
      const due = new Date(data.dueDate);
      taskData.endDate = Timestamp.fromDate(due);
      taskData.dueTimestamp = due.getTime();
    }
    if (data.startDate) {
      taskData.startDate = Timestamp.fromDate(new Date(data.startDate));
    } else if (data.dueDate) {
      // Fallback: use now as startDate
      taskData.startDate = Timestamp.fromDate(new Date(nowMs));
    } else {
      taskData.startDate = Timestamp.fromDate(new Date(nowMs));
    }

    // Group task: write to groups/{groupId}/tasks
    if (data.groupId) {
      taskData.taskType = "group";
      // Get group name for context
      const groupDoc = await db.collection("groups").doc(data.groupId).get();
      if (groupDoc.exists) {
        taskData.groupName = groupDoc.data()?.groupName || null;
      }
      const ref = await db
        .collection("groups")
        .doc(data.groupId)
        .collection("tasks")
        .add(taskData);

      // Add self-referencing id + status_docId + uniqueKey
      await ref.update({
        id: ref.id,
        status_docId: `pending_${ref.id}`,
        uniqueKey: `${ref.id}-${nowMs}`,
      });

      return {
        id: ref.id,
        title: data.title,
        description: data.description || "",
        status: "pending" as const,
        dueDate: data.dueDate || null,
        createdAt: new Date().toISOString(),
        createdByUserId: userId,
        groupId: data.groupId,
        groupName: taskData.groupName || null,
        assignedTo: [userId],
        taskType: "group",
      };
    }

    // Personal task: write to usertasks/{userId}/tasks
    const ref = await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .add(taskData);

    // Add self-referencing id + status_docId + uniqueKey (mobile app compat)
    await ref.update({
      id: ref.id,
      status_docId: `pending_${ref.id}`,
      uniqueKey: `${ref.id}-${nowMs}`,
    });

    // Increment usage counter
    await db
      .collection("users")
      .doc(userId)
      .update({ usedTasksThisMonth: FieldValue.increment(1) });

    return {
      id: ref.id,
      title: data.title,
      description: data.description || "",
      status: "pending" as const,
      dueDate: data.dueDate || null,
      createdAt: new Date().toISOString(),
      createdByUserId: userId,
      groupId: null,
      groupName: null,
      assignedTo: [userId],
    };
  },

  async updateTask(userId, taskId, data) {
    const update: Record<string, any> = {
      lastModified: FieldValue.serverTimestamp(),
      editCount: FieldValue.increment(1),
    };
    if (data.title !== undefined) update.taskName = data.title;
    if (data.description !== undefined) update.taskDescription = data.description;
    if (data.status !== undefined) {
      update.status = data.status;
      update.status_docId = `${data.status}_${taskId}`;
    }
    if (data.dueDate !== undefined) {
      if (data.dueDate) {
        const due = new Date(data.dueDate);
        update.endDate = Timestamp.fromDate(due);
        update.dueTimestamp = due.getTime();
      } else {
        update.endDate = null;
        update.dueTimestamp = null;
      }
    }

    await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .doc(taskId)
      .update(update);
  },

  async deleteTask(userId, taskId) {
    await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .doc(taskId)
      .update({ status: "cancelled", updatedAt: FieldValue.serverTimestamp() });
  },
};

// ── Groups ──

export const groupRepo: GroupRepository = {
  async getUserGroups(userId) {
    const docSnap = await db.collection("usergroups").doc(userId).get();
    if (!docSnap.exists) return [];

    const data = docSnap.data() || {};
    const groupIds = Object.values(data).map((v: any) => v.groupId || "");
    if (groupIds.length === 0) return [];

    const groups: Group[] = [];
    // Fetch in chunks of 30
    for (let i = 0; i < groupIds.length; i += 30) {
      const chunk = groupIds.slice(i, i + 30).filter(Boolean);
      if (chunk.length === 0) continue;

      const snap = await db
        .collection("groups")
        .where("__name__", "in", chunk)
        .get();

      snap.docs.forEach((d) => {
        const gd = d.data();
        groups.push({
          id: d.id,
          groupName: gd.groupName || "Unnamed",
          createdBy: gd.createdBy || "",
          adminUserId: gd.adminUserId || "",
          memberIds: gd.memberIds || [],
          createdAt: toISO(gd.createdAt),
        });
      });
    }

    return groups;
  },

  async getGroup(groupId) {
    const doc = await db.collection("groups").doc(groupId).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      groupName: data.groupName || "Unnamed",
      createdBy: data.createdBy || "",
      adminUserId: data.adminUserId || "",
      memberIds: data.memberIds || [],
      createdAt: toISO(data.createdAt),
    };
  },

  async getGroupMembers(groupId) {
    const groupDoc = await db.collection("groups").doc(groupId).get();
    if (!groupDoc.exists) return [];

    const memberIds: string[] = groupDoc.data()?.memberIds || [];
    if (memberIds.length === 0) return [];

    const members: GroupMember[] = [];
    for (let i = 0; i < memberIds.length; i += 30) {
      const chunk = memberIds.slice(i, i + 30);
      const snap = await db
        .collection("users")
        .where("__name__", "in", chunk)
        .get();
      snap.docs.forEach((d) => {
        members.push({ id: d.id, email: d.data().email || "" });
      });
    }
    return members;
  },

  async getGroupTasks(groupId) {
    const snap = await db
      .collection("groups")
      .doc(groupId)
      .collection("tasks")
      .orderBy("createdAt", "desc")
      .get();

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.taskName || data.title || "",
        description: data.taskDescription || data.description || "",
        status: data.status || "pending",
        dueDate: data.endDate ? toISO(data.endDate) : data.dueDate ? toISO(data.dueDate) : null,
        createdAt: toISO(data.createdAt),
        updatedAt: data.lastModified ? toISO(data.lastModified) : undefined,
        groupId,
        groupName: null,
        assignedTo: data.assignedTo || [],
        createdByUserId: data.createdByUserId || "",
      } satisfies Task;
    });
  },
};

// ── User ──

export const userRepo: UserRepository = {
  async getProfile(userId) {
    const doc = await db.collection("users").doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      uid: doc.id,
      email: data.email || "",
      membershipLevel: data.membershipLevel || "free",
      createdAt: toISO(data.createdAt),
      usedTasksThisMonth: data.usedTasksThisMonth || 0,
      usedGroupsThisMonth: data.usedGroupsThisMonth || 0,
      taskLimitPerMonth: data.taskLimitPerMonth || 50,
      groupLimitPerMonth: data.groupLimitPerMonth || 3,
    };
  },
};
