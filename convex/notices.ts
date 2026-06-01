import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllNotices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notices").order("desc").collect();
  },
});

export const getNoticesByFirm = query({
  args: { firmId: v.id("firms") },
  handler: async (ctx, { firmId }) => {
    return await ctx.db
      .query("notices")
      .filter((q) => q.eq(q.field("firmId"), firmId))
      .order("desc")
      .collect();
  },
});

export const getDocumentUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveNoticeDocument = mutation({
  args: {
    noticeId: v.id("notices"),
    documentStorageId: v.id("_storage"),
    uploadedFileName: v.string(),
  },
  handler: async (ctx, { noticeId, documentStorageId, uploadedFileName }) => {
    await ctx.db.patch(noticeId, { documentStorageId, uploadedFileName });
  },
});

export const removeNoticeDocument = mutation({
  args: { noticeId: v.id("notices") },
  handler: async (ctx, { noticeId }) => {
    await ctx.db.patch(noticeId, {
      documentStorageId: undefined,
      uploadedFileName: undefined,
    });
  },
});

export const saveAiDraft = mutation({
  args: {
    noticeId: v.id("notices"),
    aiDraft: v.string(),
  },
  handler: async (ctx, { noticeId, aiDraft }) => {
    await ctx.db.patch(noticeId, { aiDraft });
  },
});

export const updateNoticeStatus = mutation({
  args: {
    noticeId: v.id("notices"),
    status: v.string(),
  },
  handler: async (ctx, { noticeId, status }) => {
    await ctx.db.patch(noticeId, { status });
  },
});

export const createNotice = mutation({
  args: {
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
    documentStorageId: v.optional(v.id("_storage")),
    uploadedFileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notices", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
export const deleteNotice = mutation({
  args: { noticeId: v.id("notices") },
  handler: async (ctx, { noticeId }) => {
    await ctx.db.delete(noticeId);
  },
});
