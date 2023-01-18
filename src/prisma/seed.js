const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const modules = [
  { key: 'ROLE', name: 'Roles' },
  { key: 'USER', name: 'Usuarios' },
  { key: 'LIST_ITEM', name: 'Listas' },
  { key: 'FARM', name: 'Fincas' },
  { key: 'ANIMAL', name: 'Animales' },
  { key: 'REPORT', name: 'Reportes' },
  { key: 'UPLOAD', name: 'Cargar datos' },
];

const role = { key: 'ADMIN', name: 'Admin' };

const user = {
  email: 'jcgonzave@gmail.com',
  password: '1234',
  name: 'Juan Carlos Gonzalez Arroyave',
  phone: '3003026072',
};

const animals = [{ code: '12345' }, { code: '67890' }];

const load = async () => {
  try {
    await prisma.user.deleteMany();
    await prisma.$queryRaw`ALTER TABLE User AUTO_INCREMENT = 1`;

    await prisma.role.deleteMany();
    await prisma.$queryRaw`ALTER TABLE Role AUTO_INCREMENT = 1`;

    await prisma.module.deleteMany();
    await prisma.$queryRaw`ALTER TABLE Module AUTO_INCREMENT = 1`;

    await prisma.farm.deleteMany();
    await prisma.$queryRaw`ALTER TABLE Farm AUTO_INCREMENT = 1`;

    await prisma.animal.deleteMany();
    await prisma.$queryRaw`ALTER TABLE Animal AUTO_INCREMENT = 1`;

    await prisma.module.createMany({
      data: modules,
    });

    const roleData = await prisma.role.create({
      data: role,
    });

    const userData = await prisma.user.create({
      data: {
        roleId: roleData.id,
        ...user,
      },
    });

    await prisma.farm.create({
      data: {
        name: 'Arroyo Rico',
        farmerId: userData.id,
        animals: {
          createMany: {
            data: animals,
          },
        },
      },
    });

    console.log('Added data');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
