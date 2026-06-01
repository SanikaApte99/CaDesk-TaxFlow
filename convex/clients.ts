import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: { firmId: v.id("firms") },
  handler: async (ctx, { firmId }) => {
    return await ctx.db
      .query("clients")
      .filter((q) => q.eq(q.field("firmId"), firmId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    firmId: v.id("firms"),
    name: v.string(),
    pan: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    type: v.string(),
    category: v.string(),
    assignedRole: v.array(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Auto-generate initials from name
    const initials = args.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    // Pick avatar color based on category
    const colorMap: Record<string, string> = {
      individual: "bg-blue-600",
      business: "bg-amber-700",
      nri: "bg-teal-700",
    };

    const id = await ctx.db.insert("clients", {
      ...args,
      initials,
      avatarColor: colorMap[args.category] ?? "bg-gray-600",
      progress: 0,
      status: "docs-pending",
    });

    // Log activity
    await ctx.db.insert("activity", {
      text: `New client added: ${args.name}`,
      color: "bg-blue-500",
      timestamp: Date.now(),
    });

    return id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("clients"),
    status: v.string(),
    progress: v.number(),
  },
  handler: async (ctx, { id, status, progress }) => {
    const client = await ctx.db.get(id);
    if (!client) return;

    await ctx.db.patch(id, { status, progress });

    await ctx.db.insert("activity", {
      text: `${client.name} · status updated to ${status}`,
      color: "bg-amber-500",
      timestamp: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    const client = await ctx.db.get(id);
    if (!client) return;
    await ctx.db.delete(id);
    await ctx.db.insert("activity", {
      text: `Client removed: ${client.name}`,
      color: "bg-red-500",
      timestamp: Date.now(),
    });
  },
});
export const batchCreate = mutation({
  args: {
    firmId: v.id("firms"),
    clients: v.array(
      v.object({
        name: v.string(),
        pan: v.string(),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        type: v.string(),
        category: v.string(),
        assignedRole: v.array(v.string()),
        createdBy: v.string(),
      }),
    ),
  },
  handler: async (ctx, { firmId, clients }) => {
    const colorMap: Record<string, string> = {
      individual: "bg-blue-600",
      business: "bg-amber-700",
      nri: "bg-teal-700",
    };

    let insertedCount = 0;

    for (const client of clients) {
      // Skip duplicate PANs
      const existing = await ctx.db
        .query("clients")
        .filter((q) =>
          q.and(
            q.eq(q.field("firmId"), firmId),
            q.eq(q.field("pan"), client.pan),
          ),
        )
        .first();

      if (existing) continue;

      const initials = client.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      await ctx.db.insert("clients", {
        ...client,
        firmId,
        initials,
        avatarColor: colorMap[client.category] ?? "bg-gray-600",
        progress: 0,
        status: "docs-pending",
      });

      insertedCount++;
    }

    await ctx.db.insert("activity", {
      text: `${insertedCount} clients imported from Excel`,
      color: "bg-green-500",
      timestamp: Date.now(),
    });

    return {
      inserted: insertedCount,
      skipped: clients.length - insertedCount,
    };
  },
});
