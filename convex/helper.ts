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
