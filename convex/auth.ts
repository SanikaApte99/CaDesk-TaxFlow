import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerFirm = mutation({
  args: {
    firmName: v.string(),
    gstin: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    adminName: v.string(),
    adminEmail: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.adminEmail))
      .first();

    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    // Create the firm
    const firmId = await ctx.db.insert("firms", {
      firmName: args.firmName,
      gstin: args.gstin,
      city: args.city,
      phone: args.phone,
      createdAt: Date.now(),
    });

    // Create the admin user
    const userId = await ctx.db.insert("users", {
      firmId,
      name: args.adminName,
      email: args.adminEmail,
      passwordHash: args.passwordHash,
      role: "admin",
      createdAt: Date.now(),
    });

    return { firmId, userId };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
  },
});

export const getFirmById = query({
  args: { firmId: v.id("firms") },
  handler: async (ctx, { firmId }) => {
    return await ctx.db.get(firmId);
  },
});

export const addTeamMember = mutation({
  args: {
    firmId: v.id("firms"),
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) throw new Error("EMAIL_EXISTS");

    return await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getTeamMembers = query({
  args: { firmId: v.id("firms") },
  handler: async (ctx, { firmId }) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("firmId"), firmId))
      .collect();
  },
});
