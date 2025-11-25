'use node';
import axios from 'axios';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction } from './_generated/server';

export const updateUserStreamToken = internalAction({
  args: {
    user: v.object({
      name: v.string(),
      email: v.string(),
      _id: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }
    const user = args.user;
    const { data } = await axios.post(
      `https://hospice-connect-web.vercel.app/api/token`,
      {
        name: user?.name,
        email: user?.email,
        id: user?._id,
      }
    );
    console.log({ data });

    await ctx.runMutation(internal.users.createUser, {
      streamToken: data.streamToken,
      user: {
        name: user?.name,
        email: user?.email,
        _id: user?._id,
      },
    });
  },
});
