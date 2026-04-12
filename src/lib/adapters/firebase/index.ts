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

// ── Tasks ──

export const taskRepo: TaskRepository = {
  async getUserTasks(userId) {
    const snap = await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .orderBy("createdAt", "desc")
      .get();

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || "",
        description: data.description || "",
        status: data.status || "pending",
        dueDate: data.dueDate ? toISO(data.dueDate) : null,
        createdAt: toISO(data.createdAt),
        updatedAt: data.updatedAt ? toISO(data.updatedAt) : undefined,
        groupId: data.groupId || null,
        groupName: data.groupName || null,
        assignedTo: data.assignedTo || [],
        createdByUserId: data.createdByUserId || userId,
      } satisfies Task;
    });
  },

  async getTask(userId, taskId) {
    const doc = await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .doc(taskId)
      .get();

    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      title: data.title || "",
      description: data.description || "",
      status: data.status || "pending",
      dueDate: data.dueDate ? toISO(data.dueDate) : null,
      createdAt: toISO(data.createdAt),
      updatedAt: data.updatedAt ? toISO(data.updatedAt) : undefined,
      groupId: data.groupId || null,
      groupName: data.groupName || null,
      assignedTo: data.assignedTo || [],
      createdByUserId: data.createdByUserId || userId,
    };
  },

  async createTask(userId, data) {
    const taskData: Record<string, any> = {
      title: data.title,
      description: data.description || "",
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdByUserId: userId,
      groupId: data.groupId || null,
      groupName: null,
    };

    if (data.dueDate) {
      taskData.dueDate = Timestamp.fromDate(new Date(data.dueDate));
    }

    const ref = await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .add(taskData);

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
      groupId: data.groupId || null,
      groupName: null,
      assignedTo: [],
    };
  },

  async updateTask(userId, taskId, data) {
    const update: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.status !== undefined) update.status = data.status;
    if (data.dueDate !== undefined) {
      update.dueDate = data.dueDate
        ? Timestamp.fromDate(new Date(data.dueDate))
        : null;
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
        title: data.title || "",
        description: data.description || "",
        status: data.status || "pending",
        dueDate: data.dueDate ? toISO(data.dueDate) : null,
        createdAt: toISO(data.createdAt),
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
