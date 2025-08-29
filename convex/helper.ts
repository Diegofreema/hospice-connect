import { Id } from './_generated/dataModel';
import { QueryCtx } from './_generated/server';

export const getImage = (ctx: QueryCtx, imageId: Id<'_storage'>) => {
  return ctx.storage.getUrl(imageId);
};
