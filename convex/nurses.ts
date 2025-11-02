import {getAuthUserId} from "@convex-dev/auth/server";
import {filter} from "convex-helpers/server/filter";
import {paginationOptsValidator} from "convex/server";
import {ConvexError, v} from "convex/values";
import {Id} from "./_generated/dataModel";
import {mutation, query, QueryCtx} from "./_generated/server";
import {getAvailability, getImage, getRatings} from "./helper";
import {discipline} from "./schema";

export const createNurse = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    gender: v.string(),
    phoneNumber: v.string(),
    licenseNumber: v.string(),
    stateOfRegistration: v.string(),
    dateOfBirth: v.string(),
    discipline: discipline,
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new ConvexError({ message: "Unauthorized" });
      }
      const nurseId = await ctx.db.insert("nurses", {
        ...args,
        isApproved: false,
        userId,
      });
      await ctx.db.patch(userId, {
        name: args.firstName + " " + args.lastName,
      });
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ] as const;
      const formattedDays = days.map((day) => ({
        day: day,
        available: false,
      }));
      await ctx.db.insert("availabilities", {
        nurseId,
        days: formattedDays,
      });
      await ctx.db.patch(userId, {
        isBoarded: true,
        isNurse: true,
      });
    } catch (error: any) {
      throw new ConvexError({ message: error.message });
    }
  },
});

export const getNurseById = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const nurse = await ctx.db
      .query("nurses")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
    if (!nurse) {
      return null;
    }

    const availabilities = await ctx.db
      .query("availabilities")
      .withIndex("nurseId", (q) => q.eq("nurseId", nurse._id))
      .first();
    const image = nurse.imageId ? await getImage(ctx, nurse.imageId) : null;
    const user = await ctx.db.get(userId);
    return {
      ...nurse,
      email: user?.email as string,
      image,
      availabilities,
    };
  },
});

export const updateNurseDailyAvailability = mutation({
  args: {
    nurseId: v.id("nurses"),
    day: v.string(),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      const nurse = await ctx.db.get(args.nurseId);
      if (!nurse) {
        throw new ConvexError({ message: "Nurse not found" });
      }
      const availabilities = await ctx.db
        .query("availabilities")
        .withIndex("nurseId", (q) => q.eq("nurseId", nurse._id))
        .first();
      if (!availabilities) {
        throw new ConvexError({ message: "Availabilities not found" });
      }
      const days = availabilities.days.map((day) => {
        if (day.day === args.day) {
          return {
            ...day,
            available: args.available,
          };
        }
        return day;
      });
      await ctx.db.patch(availabilities._id, {
        days,
      });
    } catch (error: any) {
      throw new ConvexError({ message: error.message });
    }
  },
});
export const updateNurseStartAndEndTimeAvailability = mutation({
  args: {
    nurseId: v.id("nurses"),
    day: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const nurse = await ctx.db.get(args.nurseId);
      if (!nurse) {
        throw new ConvexError({ message: "Nurse not found" });
      }
      const availabilities = await ctx.db
        .query("availabilities")
        .withIndex("nurseId", (q) => q.eq("nurseId", nurse._id))
        .first();
      if (!availabilities) {
        throw new ConvexError({ message: "Availabilities not found" });
      }
      const days = availabilities.days.map((day) => {
        if (day.day === args.day) {
          return {
            ...day,
            startTime: args.startTime,
            endTime: args.endTime,
          };
        }
        return day;
      });
      await ctx.db.patch(availabilities._id, {
        days,
      });
    } catch (error: any) {
      throw new ConvexError({ message: error.message });
    }
  },
});

export const editNurse = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),

    phoneNumber: v.string(),
    licenseNumber: v.string(),
    stateOfRegistration: v.string(),

    discipline: discipline,
    rate: v.optional(v.number()),
    address: v.optional(v.string()),
    nurseId: v.id("nurses"),
    zipCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: "Unauthorized" });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: "Nurse not found" });
    }

    await ctx.db.patch(nurse._id, {
      rate: args.rate,
      address: args.address,
      phoneNumber: args.phoneNumber,
      zipCode: args.zipCode,
    });

    await ctx.db.insert("pendingNurseProfile", {
      firstName: args.firstName,
      lastName: args.lastName,
      licenseNumber: args.licenseNumber,
      stateOfRegistration: args.stateOfRegistration,
      discipline: args.discipline,
      isApproved: false,
      nurseId: args.nurseId,
    });
  },
});

export const updateNurseProfilePicture = mutation({
  args: {
    nurseId: v.id("nurses"),
    imageId: v.id("_storage"),
    oldImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    try {
      const nurse = await ctx.db.get(args.nurseId);
      if (!nurse) {
        throw new ConvexError({ message: "Nurse not found" });
      }
      await ctx.db.patch(nurse._id, {
        imageId: args.imageId,
      });
      await ctx.db.patch(nurse.userId, {
        imageId: args.imageId,
      });
      if (args.oldImageId) {
        await ctx.storage.delete(args.oldImageId);
      }
    } catch (error: any) {
      console.log({ error });

      throw new ConvexError({ message: error.message });
    }
  },
});

export const rateNurse = mutation({
  args: { rate: v.number(), nurseId: v.id("nurses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: "Unauthorized" });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: "Nurse not found" });
    }
    await ctx.db.insert("ratings", {
      nurseId: args.nurseId,
      rate: args.rate,
    });
  },
});

// ? queries
export const getNurses = query({
  args: {
    range1: v.number(),
    range2: v.number(),
    discipline: v.union(
      v.literal("RN"),
      v.literal("LVN"),
      v.literal("HHA"),
      v.literal("All"),
    ),
    todayToText: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const minRange = Math.min(args.range1, args.range2);
    const maxRange = Math.max(args.range1, args.range2);

    // Build the query with TypeScript filter
    const nurses = await filter(ctx.db.query("nurses"), (nurse) => {
      // Apply discipline filter
      const matchesDiscipline =
        args.discipline === "All" || nurse.discipline === args.discipline;
      // Apply range filter
      const matchesRange =
        (nurse.rate || 0) >= minRange && (nurse.rate || 0) <= maxRange;
      return matchesDiscipline && matchesRange;
    }).paginate(args.paginationOpts);
    const nursesImage = await Promise.all(
      nurses.page.map(async (nurse) => {
        const image = await getImage(ctx, nurse.imageId);
        const available = await getAvailability(
          ctx,
          nurse._id,
          args.todayToText,
        );
        const ratings = await getRatings(ctx, nurse._id);
        return {
          ...nurse,
          image,
          available,
          ratings,
        };
      }),
    );
    return {
      ...nurses,
      page: nursesImage,
    };
  },
});

export const getNurseByNurseId = query({
  args: {
    nurseId: v.id("nurses"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: "Nurse not found" });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: "Nurse not found" });
    }
    const user = await ctx.db.get(nurse.userId);
    if (!user) {
      throw new ConvexError({ message: "User not found" });
    }
    const image = nurse.imageId
      ? await ctx.storage.getUrl(nurse.imageId)
      : null;
    return {
      ...nurse,
      image,
      email: user.email || "N/A",
    };
  },
});

export const searchNursesByFirstNameAndLastName = query({
  args: {
    name: v.string(),
    todayToText: v.string(),
    discipline: v.optional(discipline),
  },
  handler: async (ctx, args) => {
    const nurses = await filter(ctx.db.query("nurses"), (nurse) => {
      if (!args.name) return false;
      if (args.discipline) {
        return (
          (nurse.firstName.toLowerCase().includes(args.name.toLowerCase()) ||
            nurse.lastName.toLowerCase().includes(args.name.toLowerCase())) &&
          nurse.discipline === args.discipline
        );
      }
      return (
        nurse.firstName.toLowerCase().includes(args.name.toLowerCase()) ||
        nurse.lastName.toLowerCase().includes(args.name.toLowerCase())
      );
    }).take(30);
    const nursesImage = await Promise.all(
      nurses.map(async (nurse) => {
        const image = await getImage(ctx, nurse.imageId);
        const available = await getAvailability(
          ctx,
          nurse._id,
          args.todayToText,
        );
        const ratings = await getRatings(ctx, nurse._id);
        return {
          ...nurse,
          image,
          available,
          ratings,
        };
      }),
    );

    return nursesImage;
  },
});

// ? helpers

export const getNurseDetails = async (
  ctx: QueryCtx,
  nurseId?: Id<"nurses">,
) => {
  if (!nurseId) {
    return null;
  }
  const nurse = await ctx.db.get(nurseId);
  if (!nurse) {
    return null;
  }
  const nurseUser = await ctx.db.get(nurse.userId);
  const image = nurse.imageId ? await getImage(ctx, nurse.imageId) : null;
  return {
    ...nurse,
    image,
    nurseUser,
  };
};
