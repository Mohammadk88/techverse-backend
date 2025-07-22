import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFollowSystem() {
  try {
    console.log('🧪 Testing Follow System...\n');

    // Check if we have users to test with
    const users = await prisma.users.findMany({
      take: 3,
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (users.length < 2) {
      console.log('❌ Need at least 2 users to test follow system');
      return;
    }

    console.log('📊 Available users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username || user.email} (ID: ${user.id})`);
    });
    console.log();

    const user1 = users[0];
    const user2 = users[1];

    // Test follow creation
    console.log(`👥 Testing follow: ${user1.username || user1.email} follows ${user2.username || user2.email}`);
    
    const follow = await prisma.follows.create({
      data: {
        follower_id: user1.id,
        following_id: user2.id,
      },
      include: {
        users_follows_follower_idTousers: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        users_follows_following_idTousers: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Follow created successfully:');
    console.log(`   ${follow.users_follows_follower_idTousers.username || follow.users_follows_follower_idTousers.email} → ${follow.users_follows_following_idTousers.username || follow.users_follows_following_idTousers.email}`);
    console.log();

    // Test follow counts
    console.log('📈 Testing follow counts...');
    const followersCount = await prisma.follows.count({
      where: { following_id: user2.id },
    });
    const followingCount = await prisma.follows.count({
      where: { follower_id: user1.id },
    });

    console.log(`   ${user2.username || user2.email} has ${followersCount} followers`);
    console.log(`   ${user1.username || user1.email} is following ${followingCount} users`);
    console.log();

    // Test duplicate follow prevention
    console.log('🚫 Testing duplicate follow prevention...');
    try {
      await prisma.follows.create({
        data: {
          follower_id: user1.id,
          following_id: user2.id,
        },
      });
      console.log('❌ ERROR: Duplicate follow was allowed!');
    } catch (error) {
      console.log('✅ Duplicate follow correctly prevented');
    }
    console.log();

    // Clean up
    console.log('🧹 Cleaning up test data...');
    await prisma.follows.delete({
      where: {
        id: follow.id,
      },
    });
    console.log('✅ Test data cleaned up');
    console.log();

    console.log('🎉 Follow system test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing follow system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testFollowSystem();
}

export { testFollowSystem };
