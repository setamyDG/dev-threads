/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { revalidatePath } from 'next/cache';
import Thread from '../models/thread.model';
import User from '../models/user.model';
import { connectToDb } from '../mongoose';

type Params = {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
};

export async function createThread({ text, author, communityId, path }: Params) {
  try {
    connectToDb();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    //update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error) {
    throw new Error(`Error creating thread: ${error}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  connectToDb();
  // calculate the number of posts to skip
  const skips = pageSize * (pageNumber - 1);

  // fetch the posts that have no parents (top-level threads)
  const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({
      createdAt: 'desc',
    })
    .skip(skips)
    .limit(pageSize)
    .populate({ path: 'author', model: User })
    .populate({
      path: 'children',
      populate: {
        path: 'author',
        model: User,
        select: '_id name parentId image',
      },
    });

  const totalThreads = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });

  const threads = await threadsQuery.exec();
  const isNextPage = totalThreads > pageSize * pageNumber;

  return {
    threads,
    isNextPage,
  };
}

export async function fetchThreadById(id: string) {
  connectToDb();
  try {
    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image',
      }) // Populate the author field with _id and username
      // .populate({
      //   path: 'community',
      //   model: Community,
      //   select: '_id id name image',
      // }) // Populate the community field with _id and name
      .populate({
        path: 'children', // Populate the children field
        populate: [
          {
            path: 'author', // Populate the author field within children
            model: User,
            select: '_id id name parentId image', // Select only _id and username fields of the author
          },
          {
            path: 'children', // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: 'author', // Populate the author field within nested children
              model: User,
              select: '_id id name parentId image', // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error) {
    throw new Error(`Error fetching thread: ${error}`);
  }
}

export async function addCommentToThread(threadId: string, commentText: string, userId: string, path: string) {
  connectToDb();
  try {
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error('Thread does not exist');
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();

    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();

    revalidatePath(path);
  } catch (error) {
    throw new Error(`Error adding comment to thread: ${error}`);
  }
}
