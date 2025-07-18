import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFollowSystem() {
  try {
    console.log('🧪 Testing Follow System...\n');

    // Check if we have users to test with
    const users = await prisma.user.findMany({
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
    
    const follow = await prisma.follow.create({
      data: {
        followerId: user1.id,
        followingId: user2.id,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        following: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Follow created successfully:');
    console.log(`   ${follow.follower.username || follow.follower.email} → ${follow.following.username || follow.following.email}`);
    console.log();

    // Test follow counts
    console.log('📈 Testing follow counts...');
    const followersCount = await prisma.follow.count({
      where: { followingId: user2.id },
    });
    const followingCount = await prisma.follow.count({
      where: { followerId: user1.id },
    });

    console.log(`   ${user2.username || user2.email} has ${followersCount} followers`);
    console.log(`   ${user1.username || user1.email} is following ${followingCount} users`);
    console.log();

    // Test duplicate follow prevention
    console.log('🚫 Testing duplicate follow prevention...');
    try {
      await prisma.follow.create({
        data: {
          followerId: user1.id,
          followingId: user2.id,
        },
      });
      console.log('❌ ERROR: Duplicate follow was allowed!');
    } catch (error) {
      console.log('✅ Duplicate follow correctly prevented');
    }
    console.log();

    // Clean up
    console.log('🧹 Cleaning up test data...');
    await prisma.follow.delete({
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
