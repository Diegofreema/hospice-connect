import { Infer } from 'convex/values';
import { Id } from './_generated/dataModel';
import { QueryCtx } from './_generated/server';
import { day } from './schema';

export const getImage = (ctx: QueryCtx, imageId: Id<'_storage'>) => {
  return ctx.storage.getUrl(imageId);
};

export type DayType = Infer<typeof day>;
