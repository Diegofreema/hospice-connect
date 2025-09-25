import { Infer } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, QueryCtx } from './_generated/server';
import { day } from './schema';

export const getImage = (ctx: QueryCtx, imageId?: Id<'_storage'>) => {
  return imageId ? ctx.storage.getUrl(imageId) : null;
};

export type DayType = Infer<typeof day>;

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getAvailability = async (
  ctx: QueryCtx,
  nurseId: Id<'nurses'>,
  day: string
) => {
  const availabilities = await ctx.db
    .query('availabilities')
    .withIndex('nurseId', (q) => q.eq('nurseId', nurseId))
    .first();
  console.log({ availabilities });

  return availabilities?.days.find((d) => d.day === day);
};

export const getRatings = async (ctx: QueryCtx, nurseId: Id<'nurses'>) => {
  const ratings = await ctx.db
    .query('ratings')
    .withIndex('nurseId', (q) => q.eq('nurseId', nurseId))
    .collect();
  return ratings.reduce((acc, rating) => acc + rating.rate, 0);
};
