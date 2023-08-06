/* eslint-disable @typescript-eslint/no-explicit-any */
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import ThreadCard from '@/components/cards/ThreadCard';
import Comment from '@/components/forms/Comment';
import { fetchThreadById } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';

type Props = {
  params: {
    id: string;
  };
};
const Page = async ({ params }: Props) => {
  const user = await currentUser();

  if (!params.id || !user) {
    return null;
  }

  const userInfo = await fetchUser(user.id as string);

  if (!userInfo.onboarded) redirect('/onboarding');

  const thread = await fetchThreadById(params.id);

  return (
    <section className='relative'>
      <div>
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={user?.id || ''}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      </div>
      <div className='mt-7'>
        <Comment threadId={thread.id} currentUserImg={userInfo.image} currentUserId={JSON.stringify(userInfo._id)} />
      </div>
      <div className='mt-7'>
        {thread.children.map((comment: any) => (
          <ThreadCard
            key={comment._id}
            id={comment._id}
            currentUserId={comment?.id || ''}
            parentId={comment.parentId}
            content={comment.text}
            author={comment.author}
            community={comment.community}
            createdAt={comment.createdAt}
            comments={comment.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default Page;
