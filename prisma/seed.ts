import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = [
  { name: 'Organics', slug: 'organics', description: 'Organic products and food items.' },
  { name: 'Textiles', slug: 'textiles', description: 'Fabrics, clothing, and textile materials.' },
  { name: 'Living', slug: 'living', description: 'Home decor, furniture, and living essentials.' },
  { name: 'Chemicals', slug: 'chemicals', description: 'Industrial and commercial chemicals.' },
  { name: 'Machinery', slug: 'machinery', description: 'Heavy machinery and industrial equipment.' },
  { name: 'Packaging', slug: 'packaging', description: 'Packaging materials and solutions.' },
  { name: 'Agriculture', slug: 'agriculture', description: 'Agricultural tools, seeds, and fertilizers.' },
];

async function main() {
  console.log('Wiping existing catalog data...');
  // Delete in correct order to avoid foreign key constraints
  await prisma.productImage.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.dynamicProduct.deleteMany();
  await prisma.productTemplateField.deleteMany();
  await prisma.productTemplate.deleteMany();
  await prisma.productSubcategory.deleteMany();
  await prisma.productCategory.deleteMany();

  console.log('Catalog wiped. Seeding new data...');

  for (const cat of categories) {
    console.log(`Seeding category: ${cat.name}`);
    const category = await prisma.productCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        status: 'active',
      }
    });

    const template = await prisma.productTemplate.create({
      data: {
        name: `${cat.name} Template`,
        slug: `${cat.slug}-template`,
        categoryId: category.id,
        isActive: true,
      }
    });

    // Placeholder products generation loop removed. Build real products in Admin panel.
  }

  // Seed Super Admin Users directly
  console.log('👤 Seeding default Super Admin users...');
  const bcrypt = await import('bcryptjs');
  const targetPassword = await bcrypt.hash('Lokaa2026!', 10);

  // Find or create Super Admin Role
  let superAdminRole = await prisma.role.findFirst({
    where: { slug: 'super-admin' }
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        name: 'Super Admin',
        slug: 'super-admin',
        description: 'Super Admin privileges',
        level: 0
      }
    });
  }

  await prisma.user.upsert({
    where: { email: 'boganbhuvanesh2213@gmail.com' },
    update: { password: targetPassword },
    create: {
      email: 'boganbhuvanesh2213@gmail.com',
      password: targetPassword,
      firstName: 'Bogan',
      lastName: 'Bhuvanesh',
      roleId: superAdminRole.id,
      status: 'active'
    }
  });
  console.log('✅ Super Admin user seeded (email: boganbhuvanesh2213@gmail.com)');

  await prisma.user.upsert({
    where: { email: 'vimal.vilvijayan@gmail.com' },
    update: { password: targetPassword },
    create: {
      email: 'vimal.vilvijayan@gmail.com',
      password: targetPassword,
      firstName: 'Vimal',
      lastName: 'Vilvijayan',
      roleId: superAdminRole.id,
      status: 'active'
    }
  });
  console.log('✅ Super Admin user seeded (email: vimal.vilvijayan@gmail.com)');

  console.log('Seeding completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
