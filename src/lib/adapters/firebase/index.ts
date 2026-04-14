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

// ── Rate limit / quota helpers ──

function makeErr(code: string, extras: Record<string, any> = {}) {
  const e = new Error(code);
  (e as any).code = code;
  Object.assign(e as any, extras);
  return e;
}

// Shared constants
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 60;            // max 60 writes/min (create + update combined)
const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_MAX = 200;           // max 200 creates/day (only applies to create)
const MONTHLY_MAX_PAID = 2000;   // hard cap for paid users
const VIOLATION_THRESHOLD = 3;   // 3 rate-limit hits → ban
const BAN_MS = 24 * 60 * 60 * 1000;
const GLOBAL_MAX_PER_MIN = 1000; // system-wide soft cap

// Checks ban + rate limit (no quota). Used by both create and update.
// Throws BANNED / RATE_LIMITED / GLOBAL_LIMITED error codes.
async function enforceRateLimit(
  tx: FirebaseFirestore.Transaction,
  userRef: FirebaseFirestore.DocumentReference,
  userData: any,
  nowMs: number
) {
  // Global rate limit — shared counter across all users
  const globalRef = db.collection("meta").doc("globalStats");
  const globalSnap = await tx.get(globalRef);
  const globalData = globalSnap.data() || {};
  const gStart = globalData.windowStart || 0;
  const gCount = globalData.count || 0;

  if (nowMs - gStart > RATE_WINDOW_MS) {
    tx.set(globalRef, { windowStart: nowMs, count: 1 }, { merge: true });
  } else if (gCount >= GLOBAL_MAX_PER_MIN) {
    throw makeErr("GLOBAL_LIMITED", {
      retryAfterSec: Math.ceil((RATE_WINDOW_MS - (nowMs - gStart)) / 1000),
    });
  } else {
    tx.update(globalRef, { count: FieldValue.increment(1) });
  }

  // Per-user ban check
  const bannedUntil = userData.bannedUntil || 0;
  if (bannedUntil > nowMs) {
    throw makeErr("BANNED", {
      retryAfterSec: Math.ceil((bannedUntil - nowMs) / 1000),
    });
  }

  // Per-user rate limit
  const rlStart = userData.rateLimitWindowStart || 0;
  const rlCount = userData.rateLimitCount || 0;
  let violations = userData.rateLimitViolations || 0;

  if (nowMs - rlStart > RATE_WINDOW_MS) {
    tx.update(userRef, { rateLimitWindowStart: nowMs, rateLimitCount: 1 });
    return;
  }

  if (rlCount >= RATE_MAX) {
    violations++;
    if (violations >= VIOLATION_THRESHOLD) {
      tx.update(userRef, { bannedUntil: nowMs + BAN_MS, rateLimitViolations: 0 });
      throw makeErr("BANNED", {
        retryAfterSec: Math.ceil(BAN_MS / 1000),
        reason: "Too many rate-limit violations — account temporarily suspended",
      });
    }
    tx.update(userRef, { rateLimitViolations: violations });
    throw makeErr("RATE_LIMITED", {
      retryAfterSec: Math.ceil((RATE_WINDOW_MS - (nowMs - rlStart)) / 1000),
      violationsRemaining: VIOLATION_THRESHOLD - violations,
    });
  }

  tx.update(userRef, { rateLimitCount: FieldValue.increment(1) });
}

// ── Tasks ──

export const taskRepo: TaskRepository = {
  async getUserTasks(userId) {
    // Personal tasks
    const personalSnap = await db
      .collection("usertasks")
      .doc(userId)
      .collection("tasks")
      .orderBy("createdAt", "desc")
      .get();

    const tasks: Task[] = personalSnap.docs.map((d) => mapTask(d, userId));

    // Group tasks (where user is assigned)
    const userGroupsDoc = await db.collection("usergroups").doc(userId).get();
    if (userGroupsDoc.exists) {
      const groupsData = userGroupsDoc.data() || {};
      const groupIds = Object.values(groupsData).map((g: any) => g.groupId).filter(Boolean);
      for (const gId of groupIds) {
        try {
          const groupTasksSnap = await db
            .collection("groups")
            .doc(gId)
            .collection("tasks")
            .where("assignedTo", "array-contains", userId)
            .get();
          groupTasksSnap.docs.forEach((d) => tasks.push(mapTask(d, userId)));
        } catch { /* skip group on error */ }
      }
    }

    // Sort all by createdAt desc
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return tasks;
  },

  async getTask(userId, taskId) {
    // Personal first
    const personalRef = db.collection("usertasks").doc(userId).collection("tasks").doc(taskId);
    const personalDoc = await personalRef.get();
    if (personalDoc.exists) return mapTask(personalDoc, userId);

    // Group tasks
    const userGroupsDoc = await db.collection("usergroups").doc(userId).get();
    if (userGroupsDoc.exists) {
      const groupsData = userGroupsDoc.data() || {};
      const groupIds = Object.values(groupsData).map((g: any) => g.groupId).filter(Boolean);
      for (const gId of groupIds) {
        const groupTaskDoc = await db.collection("groups").doc(gId).collection("tasks").doc(taskId).get();
        if (groupTaskDoc.exists) return mapTask(groupTaskDoc, userId);
      }
    }
    return null;
  },

  async createTask(userId, data, userEmail?: string) {
    // Atomic quota + rate limit + soft ban check via Firestore transaction.
    const userRef = db.collection("users").doc(userId);

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const userData = userSnap.data() || {};
      const nowMs = Date.now();

      // Monthly quota (create-specific)
      const monthlyLimitRaw = userData.taskLimitPerMonth || 50;
      const membershipLevel = (userData.membershipLevel || "free").toLowerCase();
      const isPaid = membershipLevel !== "free";
      const monthlyLimit = isPaid
        ? Math.min(monthlyLimitRaw === 999999 ? MONTHLY_MAX_PAID : monthlyLimitRaw, MONTHLY_MAX_PAID)
        : monthlyLimitRaw;
      const used = userData.usedTasksThisMonth || 0;
      if (used >= monthlyLimit) {
        throw makeErr("QUOTA_EXCEEDED", { limit: monthlyLimit, used });
      }

      // Daily cap (create-specific)
      const dayWindowStart = userData.dayWindowStart || 0;
      const dayExpired = nowMs - dayWindowStart > DAY_MS;
      const usedToday = dayExpired ? 0 : (userData.usedTasksToday || 0);
      if (usedToday >= DAILY_MAX) {
        throw makeErr("DAILY_LIMIT", {
          limit: DAILY_MAX,
          retryAfterSec: Math.ceil((dayWindowStart + DAY_MS - nowMs) / 1000),
        });
      }

      // Shared: ban + rate limit + global rate limit
      await enforceRateLimit(tx, userRef, userData, nowMs);

      // Increment daily counter (only for create)
      tx.update(userRef, {
        usedTasksToday: dayExpired ? 1 : FieldValue.increment(1),
        dayWindowStart: dayExpired ? nowMs : dayWindowStart,
      });
    });

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
      startDate: data.startDate || (data.dueDate ? data.dueDate : new Date().toISOString()),
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
    if ((data as any).startDate !== undefined) {
      const sd = (data as any).startDate;
      update.startDate = sd ? Timestamp.fromDate(new Date(sd)) : null;
    }

    // Find the task location BEFORE starting the rate-limit transaction.
    // (Firestore transactions require all reads to happen before writes.)
    let taskRef: FirebaseFirestore.DocumentReference | null = null;

    const personalRef = db.collection("usertasks").doc(userId).collection("tasks").doc(taskId);
    const personalDoc = await personalRef.get();
    if (personalDoc.exists) {
      taskRef = personalRef;
    } else {
      const userGroupsDoc = await db.collection("usergroups").doc(userId).get();
      if (userGroupsDoc.exists) {
        const groupsData = userGroupsDoc.data() || {};
        const groupIds = Object.values(groupsData).map((g: any) => g.groupId).filter(Boolean);
        for (const gId of groupIds) {
          const groupTaskRef = db.collection("groups").doc(gId).collection("tasks").doc(taskId);
          const groupTaskDoc = await groupTaskRef.get();
          if (groupTaskDoc.exists) {
            taskRef = groupTaskRef;
            break;
          }
        }
      }
    }

    if (!taskRef) throw new Error("Task not found");

    // Now do rate-limit check + update in a single transaction
    const userRef = db.collection("users").doc(userId);
    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const userData = userSnap.data() || {};
      const nowMs = Date.now();

      // Shared ban + rate limit + global rate limit
      // (No monthly quota / daily cap — updates don't count toward creates)
      await enforceRateLimit(tx, userRef, userData, nowMs);

      tx.update(taskRef!, update);
    });
  },

  async deleteTask(userId, taskId) {
    // Reuse updateTask's search logic by passing status: cancelled
    await this.updateTask(userId, taskId, { status: "cancelled" });
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
