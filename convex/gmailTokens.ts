import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Check if admin has connected Gmail
export const getToken = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, { adminEmail }) => {
    return await ctx.db
      .query("gmailTokens")
      .filter((q) => q.eq(q.field("adminEmail"), adminEmail))
      .first();
  },
});

// Save tokens after OAuth (called once on first connect)
export const saveToken = mutation({
  args: {
    adminEmail: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if token already exists for this admin
    const existing = await ctx.db
      .query("gmailTokens")
      .filter((q) => q.eq(q.field("adminEmail"), args.adminEmail))
      .first();

    if (existing) {
      // Update existing token
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
      });
    } else {
      // Insert new token
      await ctx.db.insert("gmailTokens", {
        ...args,
        connectedAt: Date.now(),
      });
    }
  },
});

export const updateAccessToken = mutation({
  args: {
    adminEmail: v.string(),
    accessToken: v.string(),
    expiryDate: v.number(),
  },
  handler: async (ctx, { adminEmail, accessToken, expiryDate }) => {
    const existing = await ctx.db
      .query("gmailTokens")
      .filter((q) => q.eq(q.field("adminEmail"), adminEmail))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { accessToken, expiryDate });
    }
  },
});

export const deleteToken = mutation({
  args: { adminEmail: v.string() },
  handler: async (ctx, { adminEmail }) => {
    const existing = await ctx.db
      .query("gmailTokens")
      .filter((q) => q.eq(q.field("adminEmail"), adminEmail))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});
