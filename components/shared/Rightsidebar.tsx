import { currentUser } from '@clerk/nextjs';
import CommunityCard from '../cards/CommunityCard';
import UserCard from '../cards/UserCard';
import { fetchCommunities } from '@/lib/actions/community.actions';
import { fetchUsers } from '@/lib/actions/user.actions';

async function RightSidebar() {
  const user = await currentUser();
  if (!user) return null;

  const resultSuggestedCommunities = await fetchCommunities({
    searchString: '',
    pageNumber: 1,
    pageSize: 3,
  });

  const resultSuggestedUsers = await fetchUsers({
    userId: user.id,
    searchString: '',
    pageNumber: 1,
    pageSize: 3,
  });

  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>Suggested Communities</h3>
        {resultSuggestedCommunities.communities.map((community) => (
          <CommunityCard
            key={community.id}
            id={community.id}
            name={community.name}
            username={community.username}
            imgUrl={community.image}
            bio={community.bio}
            members={community.members}
          />
        ))}
      </div>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>Suggested Users</h3>
        {resultSuggestedUsers.users.map((user) => (
          <UserCard
            key={user.id}
            id={user.id}
            name={user.name}
            username={user.username}
            imgUrl={user.image}
            personType='User'
          />
        ))}
      </div>
    </section>
  );
}

export default RightSidebar;
