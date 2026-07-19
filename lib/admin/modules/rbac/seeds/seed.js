import prisma from '@/lib/prisma'
import PermissionService from '@/lib/admin/modules/rbac/services/permission.service.js'
import bcrypt from 'bcryptjs'

/**
 * Seed database with default roles, permissions, and data
 * Run: npx node -r dotenv/config lib/admin/modules/rbac/seeds/seed.js
 */

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // 1. Seed permissions
    console.log('📋 Seeding permissions...')
    await PermissionService.seedDefaultPermissions()
    console.log('✅ Permissions seeded')

    // 2. Seed roles
    console.log('👥 Seeding roles...')
    const permissions = await prisma.permission.findMany()

    // Super Admin role - all permissions
    const superAdminPerms = permissions.filter(p => 
      ['rbac', 'super_admin'].includes(p.module)
    )
    
    const superAdminRole = await prisma.role.upsert({
      where: { slug: 'super_admin' },
      update: {
        permissions: {
          set: superAdminPerms.map(p => ({ id: p.id })),
        },
      },
      create: {
        name: 'Super Admin',
        slug: 'super_admin',
        description: 'Highest authority - manages everything',
        level: 0,
        permissions: {
          connect: superAdminPerms.map(p => ({ id: p.id })),
        },
      },
      include: { permissions: true },
    })
    console.log('✅ Super Admin role created')

    // Admin role - most permissions except RBAC
    const adminPerms = permissions.filter(p => p.module !== 'rbac')
    
    const adminRole = await prisma.role.upsert({
      where: { slug: 'admin' },
      update: {
        permissions: {
          set: adminPerms.map(p => ({ id: p.id })),
        },
      },
      create: {
        name: 'Admin',
        slug: 'admin',
        description: 'Daily operations manager - can create employees and manage most resources',
        level: 1,
        permissions: {
          connect: adminPerms.map(p => ({ id: p.id })),
        },
      },
      include: { permissions: true },
    })
    console.log('✅ Admin role created')

    // Employee role - limited permissions
    const employeePerms = permissions.filter(p => {
      const allowedModules = ['crm', 'rfqs', 'orders', 'products', 'analytics', 'tasks', 'notifications']
      const deniedActions = ['manage', 'delete']
      return allowedModules.includes(p.module) && !deniedActions.includes(p.action)
    })

    const employeeRole = await prisma.role.upsert({
      where: { slug: 'employee' },
      update: {
        permissions: {
          set: employeePerms.map(p => ({ id: p.id })),
        },
      },
      create: {
        name: 'Employee',
        slug: 'employee',
        description: 'Standard employee - limited access to assigned work',
        level: 2,
        permissions: {
          connect: employeePerms.map(p => ({ id: p.id })),
        },
      },
      include: { permissions: true },
    })
    console.log('✅ Employee role created')

    // 3. Seed default Super Admin user
    console.log('👤 Seeding default Super Admin user...')
    
    const hashedPassword = await bcrypt.hash('admin@lokaa123', 10)
    
    const superAdminUser = await prisma.user.upsert({
      where: { email: 'superadmin@lokaa.com' },
      update: {},
      create: {
        email: 'superadmin@lokaa.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+1234567890',
        roleId: superAdminRole.id,
        role: 0,
        status: 'active',
        companyId: 1
      }
    })
    console.log('✅ Super Admin user created (email: superadmin@lokaa.com)')

    // 4. Seed default Company
    console.log('🏢 Seeding company...')
    
    await prisma.company.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Lokaa Global Exports',
        website: 'https://lokaa-global.com',
        email: 'info@lokaa-global.com',
        phone: '+91 9876543210',
        address: 'Global Headquarters',
        city: 'Mumbai',
        country: 'India',
        currency: 'USD'
      }
    })
    console.log('✅ Company created')

    // 5. Seed sample countries
    console.log('🌍 Seeding countries...')
    
    const countries = [
      { code: 'US', name: 'United States', region: 'North America' },
      { code: 'GB', name: 'United Kingdom', region: 'Europe' },
      { code: 'DE', name: 'Germany', region: 'Europe' },
      { code: 'IN', name: 'India', region: 'Asia' },
      { code: 'CN', name: 'China', region: 'Asia' },
      { code: 'JP', name: 'Japan', region: 'Asia' },
      { code: 'BR', name: 'Brazil', region: 'South America' },
      { code: 'AU', name: 'Australia', region: 'Oceania' },
    ]

    for (const country of countries) {
      await prisma.country.upsert({
        where: { code: country.code },
        update: {},
        create: country,
      })
    }
    console.log(`✅ ${countries.length} countries seeded`)

    console.log('\n✨ Database seeding completed successfully!')
    console.log('\n📝 Default Users:')
    console.log('  - Email: superadmin@lokaa.com')
    console.log('  - Password: admin@lokaa123')
    console.log('  - Role: Super Admin')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
