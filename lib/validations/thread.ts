import * as z from 'zod';

export const ThreadValidation = z.object({
  thread: z.string().nonempty().min(3, { message: 'Min 3 characters' }).max(30),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z.string().nonempty().min(3, { message: 'Min 3 characters' }).max(30),
});
