import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  firms: defineTable({
    firmName: v.string(),
    gstin: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    createdAt: v.number(),
  }),

  users: defineTable({
    firmId: v.id("firms"),
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(), // bcrypt hash — never store plain text
    role: v.string(), // "admin" | "senior-ca" | "associate-ca"
    createdAt: v.number(),
  }),

  clients: defineTable({
    firmId: v.id("firms"), // which firm this client belongs to
    name: v.string(),
    initials: v.string(),
    avatarColor: v.string(),
    pan: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    type: v.string(),
    category: v.string(),
    progress: v.number(),
    status: v.string(),
    assignedRole: v.array(v.string()),
    createdBy: v.string(),
  }),

  notices: defineTable({
    firmId: v.id("firms"),
    clientId: v.optional(v.id("clients")),

    clientName: v.string(),
    initials: v.string(),
    avatarColor: v.string(),

    type: v.string(),
    section: v.string(),
    sub: v.string(),

    dueDate: v.string(),
    urgency: v.string(),

    context: v.string(),

    status: v.string(),

    aiDraft: v.optional(v.string()),

    // NEW
    documentStorageId: v.optional(v.id("_storage")),
    uploadedFileName: v.optional(v.string()),
    createdAt: v.number(),
  }),

  deadlines: defineTable({
    name: v.string(),
    sub: v.string(),
    date: v.string(),
    daysLabel: v.string(),
    urgency: v.string(),
    filed: v.boolean(),
  }),

  filings: defineTable({
    clientId: v.id("clients"),
    clientName: v.string(),
    type: v.string(),
    period: v.string(),
    status: v.string(),
    dueDate: v.string(),
    filedDate: v.optional(v.string()),
    assignedTo: v.string(),
  }),

  activity: defineTable({
    text: v.string(),
    color: v.string(),
    timestamp: v.number(),
  }),

  gmailTokens: defineTable({
    adminEmail: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.number(),
    connectedAt: v.number(),
  }),
});
