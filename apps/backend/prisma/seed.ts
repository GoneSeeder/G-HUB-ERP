import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required for seeding');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const [
    hubApp,
    adminApp,
    informationApp,
    informationMemberApp,
    informationBonusCardApp,
    informationBookingApp,
  ] = await Promise.all([
    prisma.app.upsert({
      where: { code: 'hub' },
      update: {},
      create: {
        code: 'hub',
        name: 'Hub',
        description: 'Main app catalog and launcher',
      },
    }),
    prisma.app.upsert({
      where: { code: 'admin' },
      update: {},
      create: {
        code: 'admin',
        name: 'Admin Dashboard',
        description: 'User and permission management',
      },
    }),
    prisma.app.upsert({
      where: { code: 'information' },
      update: {
        name: 'Information',
        description: 'Information application folder',
      },
      create: {
        code: 'information',
        name: 'Information',
        description: 'Information application folder',
      },
    }),
    prisma.app.upsert({
      where: { code: 'information-member' },
      update: {
        name: 'บันทึกข้อมูลสมาชิก',
        description: 'Member information management',
      },
      create: {
        code: 'information-member',
        name: 'บันทึกข้อมูลสมาชิก',
        description: 'Member information management',
      },
    }),
    prisma.app.upsert({
      where: { code: 'information-bonus-card' },
      update: {
        name: 'บันทึกข้อมูลโบนัสการ์ด',
        description: 'Bonus card information management',
      },
      create: {
        code: 'information-bonus-card',
        name: 'บันทึกข้อมูลโบนัสการ์ด',
        description: 'Bonus card information management',
      },
    }),
    prisma.app.upsert({
      where: { code: 'information-booking' },
      update: {
        name: 'บันทึกการจองเข้าร้าน',
        description: 'Booking information management',
      },
      create: {
        code: 'information-booking',
        name: 'บันทึกการจองเข้าร้าน',
        description: 'Booking information management',
      },
    }),
  ]);

  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      code: 'admin',
      name: 'Administrator',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: {
      code: 'user',
      name: 'User',
    },
  });

  const informationRole = await prisma.role.upsert({
    where: { code: 'information' },
    update: {
      name: 'Information',
    },
    create: {
      code: 'information',
      name: 'Information',
    },
  });

  await prisma.roleAppPermission.upsert({
    where: {
      roleId_appId: {
        roleId: adminRole.id,
        appId: hubApp.id,
      },
    },
    update: { canAccess: true },
    create: {
      roleId: adminRole.id,
      appId: hubApp.id,
      canAccess: true,
    },
  });

  await prisma.roleAppPermission.upsert({
    where: {
      roleId_appId: {
        roleId: informationRole.id,
        appId: hubApp.id,
      },
    },
    update: { canAccess: true },
    create: {
      roleId: informationRole.id,
      appId: hubApp.id,
      canAccess: true,
    },
  });

  await prisma.roleAppPermission.upsert({
    where: {
      roleId_appId: {
        roleId: userRole.id,
        appId: hubApp.id,
      },
    },
    update: { canAccess: true },
    create: {
      roleId: userRole.id,
      appId: hubApp.id,
      canAccess: true,
    },
  });

  await prisma.roleAppPermission.upsert({
    where: {
      roleId_appId: {
        roleId: adminRole.id,
        appId: adminApp.id,
      },
    },
    update: { canAccess: true },
    create: {
      roleId: adminRole.id,
      appId: adminApp.id,
      canAccess: true,
    },
  });

  await prisma.roleAppPermission.upsert({
    where: {
      roleId_appId: {
        roleId: adminRole.id,
        appId: informationApp.id,
      },
    },
    update: { canAccess: false },
    create: {
      roleId: adminRole.id,
      appId: informationApp.id,
      canAccess: false,
    },
  });

  const informationChildApps = [
    informationMemberApp,
    informationBonusCardApp,
    informationBookingApp,
  ];

  await Promise.all(
    informationChildApps.map((app) =>
      prisma.roleAppPermission.upsert({
        where: {
          roleId_appId: {
            roleId: adminRole.id,
            appId: app.id,
          },
        },
        update: { canAccess: false },
        create: {
          roleId: adminRole.id,
          appId: app.id,
          canAccess: false,
        },
      }),
    ),
  );

  const restrictedRoles = [userRole, informationRole];
  const restrictedApps = [informationApp, ...informationChildApps];

  await Promise.all(
    restrictedRoles.flatMap((role) =>
      restrictedApps.map((app) =>
        prisma.roleAppPermission.upsert({
          where: {
            roleId_appId: {
              roleId: role.id,
              appId: app.id,
            },
          },
          update: { canAccess: false },
          create: {
            roleId: role.id,
            appId: app.id,
            canAccess: false,
          },
        }),
      ),
    ),
  );

  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'G-HUB Admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin';
  const passwordHash = await hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  const adminUser = existingAdmin
    ? await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          username: adminUsername,
          name: adminName,
          passwordHash,
          isActive: true,
        },
      })
    : await prisma.user.create({
        data: {
          username: adminUsername,
          name: adminName,
          passwordHash,
          isActive: true,
        },
      });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await Promise.all(
    restrictedApps.map((app) =>
      prisma.userAppPermission.upsert({
        where: {
          userId_appId: {
            userId: adminUser.id,
            appId: app.id,
          },
        },
        update: { canAccess: true },
        create: {
          userId: adminUser.id,
          appId: app.id,
          canAccess: true,
        },
      }),
    ),
  );

  const bonusCount = await prisma.bonusCard.count();
  if (bonusCount === 0) {
    await prisma.bonusCard.createMany({
      data: [
        {
          workDate: new Date('2026-05-14T00:00:00.000Z'),
          bonus: '6001',
          bonusName: 'THAI CHUAN QI & TRADE (2559) (SOMPONG SAEHYANG)',
          agentCode: 'C0154',
          agentName: 'THAI CHUAN QI & TRADE (2559)',
          guide: 'GE230293',
          guideName: 'SOMPONG SAEHYANG',
          partyCode: 'TCQ260512A2',
          nation: 'CN',
          adult: 17,
          child: 0,
          tourLeader: 1,
          carCode: '33-1714',
          shop: '1',
          comeFrom: 'ZHEJIANG',
          busType: 'BUSOA',
          tourIn: '08:49',
        },
        {
          workDate: new Date('2026-05-14T00:00:00.000Z'),
          bonus: '6002',
          bonusName: 'TAIXINGWANG TRAVEL (CHARTER) (ALOMOEY LEECHA)',
          agentCode: 'C0495',
          agentName: 'TAIXINGWANG TRAVEL (CHARTER)',
          guide: 'GE230467',
          guideName: 'ALOMOEY LEECHA',
          partyCode: 'TXW260512B1HPVIP',
          nation: 'CN',
          adult: 32,
          child: 0,
          tourLeader: 1,
          carCode: '32-8576',
          shop: '1',
          comeFrom: 'GUANGDONG',
          busType: 'BUSOA',
          tourIn: '08:42',
        },
        {
          workDate: new Date('2026-05-14T00:00:00.000Z'),
          bonus: '6003',
          bonusName: 'TAIXINGWANG TRAVEL (CHARTER) (SASIKARN THONGSAKULCHAI)',
          agentCode: 'C0495',
          agentName: 'TAIXINGWANG TRAVEL (CHARTER)',
          guide: 'GE230262',
          guideName: 'SASIKARN THONGSAKULCHAI',
          partyCode: 'TXW260512B2HPVIP',
          nation: 'CN',
          adult: 24,
          child: 0,
          tourLeader: 1,
          carCode: '34-4368',
          shop: '1',
          comeFrom: 'GUANGDONG',
          busType: 'BUSOA',
          tourIn: '08:35',
        },
      ],
    });
  }
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
