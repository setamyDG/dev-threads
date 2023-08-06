'use server';

import { FilterQuery, SortOrder } from 'mongoose';
import { revalidatePath } from 'next/cache';
import Thread from '../models/thread.model';
import User from '../models/user.model';
import { connectToDb } from '../mongoose';

type Payload = {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
};

export async function updateUser({ userId, username, name, bio, image, path }: Payload): Promise<void> {
  connectToDb();
  try {
    await User.findOneAndUpdate(
      {
        id: userId,
      },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      {
        upsert: true, // update and insert to db
      },
    );

    if (path === '/profile/edit') {
      revalidatePath(path);
    }
  } catch (error) {
    throw new Error(`Error updating user: ${error}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDb();
    return await User.findOne({ id: userId });
    // .populate({
    //   path: 'communities',
    //   model: Community,
    // });
  } catch (error) {
    throw new Error(`Error fetching user: ${error}`);
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    connectToDb();
    // TODO: populate community;

    const threads = await User.findOne({ id: userId }).populate({
      path: 'threads',
      model: Thread,
      populate: {
        path: 'children',
        model: Thread,
        populate: {
          path: 'author',
          model: User,
          select: 'name image id',
        },
      },
    });

    return threads;
  } catch (error) {
    throw new Error(`Error fetching user threads: ${error}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDb();
    const skip = (pageNumber - 1) & pageSize;
    const regex = new RegExp(searchString, 'i');

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== '') {
      query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query).sort(sortOptions).skip(skip).limit(pageSize);
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNextPage = totalUsersCount > pageNumber * pageSize;

    return {
      users,
      isNextPage,
    };
  } catch (error) {
    throw new Error(`Error fetching users: ${error}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDb();

    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId.toString() }, // Exclude threads authored by the same user
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id',
    });

    return replies;
  } catch (error) {
    console.error('Error fetching replies: ', error);
    throw error;
  }
}
