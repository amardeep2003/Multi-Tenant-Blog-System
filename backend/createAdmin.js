const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multi_tenant_blog';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const db = mongoose.connection.db;

    // Clear existing data
    await db.collection('tenants').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('posts').deleteMany({});
    console.log('Cleared existing data.\n');

    // ============ CREATE TENANTS ============
    
    // Tenant 1: TechCorp
    const tenant1 = await db.collection('tenants').insertOne({
      name: "TechCorp",
      slug: "techcorp",
      description: "A technology company",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Tenant created: TechCorp');

    // Tenant 2: Creative Agency
    const tenant2 = await db.collection('tenants').insertOne({
      name: "Creative Agency",
      slug: "creative-agency", 
      description: "A creative marketing agency",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Tenant created: Creative Agency\n');

    // ============ CREATE USERS FOR TECHCORP ============
    
    // Admin 1 for TechCorp
    await db.collection('users').insertOne({
      tenant: tenant1.insertedId,
      name: "John Admin",
      email: "john@techcorp.com",
      password: "john123",  // Plain text password
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Admin 2 for TechCorp
    await db.collection('users').insertOne({
      tenant: tenant1.insertedId,
      name: "Sarah Admin",
      email: "sarah@techcorp.com",
      password: "sarah123",  // Plain text password
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // User 1 for TechCorp
    await db.collection('users').insertOne({
      tenant: tenant1.insertedId,
      name: "Mike Developer",
      email: "mike@techcorp.com",
      password: "mike123",  // Plain text password
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // User 2 for TechCorp
    await db.collection('users').insertOne({
      tenant: tenant1.insertedId,
      name: "Emily Designer",
      email: "emily@techcorp.com",
      password: "emily123",  // Plain text password
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // User 3 for TechCorp
    await db.collection('users').insertOne({
      tenant: tenant1.insertedId,
      name: "Alex Tester",
      email: "alex@techcorp.com",
      password: "alex123",  // Plain text password
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Created 2 admins + 3 users for TechCorp');

    // ============ CREATE USERS FOR CREATIVE AGENCY ============
    
    // Admin 1 for Creative Agency
    await db.collection('users').insertOne({
      tenant: tenant2.insertedId,
      name: "Lisa Director",
      email: "lisa@creative.com",
      password: "lisa123",  // Plain text password
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Admin 2 for Creative Agency
    await db.collection('users').insertOne({
      tenant: tenant2.insertedId,
      name: "Tom Manager",
      email: "tom@creative.com",
      password: "tom123",  // Plain text password
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // User 1 for Creative Agency
    await db.collection('users').insertOne({
      tenant: tenant2.insertedId,
      name: "Rachel Writer",
      email: "rachel@creative.com",
      password: "rachel123",  // Plain text password
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // User 2 for Creative Agency
    await db.collection('users').insertOne({
      tenant: tenant2.insertedId,
      name: "Chris Artist",
      email: "chris@creative.com",
      password: "chris123",  // Plain text password
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // User 3 for Creative Agency
    await db.collection('users').insertOne({
      tenant: tenant2.insertedId,
      name: "Diana Social",
      email: "diana@creative.com",
      password: "diana123",  // Plain text password
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Created 2 admins + 3 users for Creative Agency\n');

    // ============ CREATE SAMPLE POSTS ============
    
    const techCorpUsers = await db.collection('users').find({ tenant: tenant1.insertedId }).toArray();
    const creativeUsers = await db.collection('users').find({ tenant: tenant2.insertedId }).toArray();

    // Posts for TechCorp users
    for (const user of techCorpUsers) {
      await db.collection('posts').insertOne({
        tenant: tenant1.insertedId,
        author: user._id,
        title: `${user.name}'s First Post`,
        content: `This is a sample blog post written by ${user.name} from TechCorp. It contains some interesting content about technology and development.`,
        status: "published",
        tags: ["tech", "blog"],
        views: Math.floor(Math.random() * 100),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Posts for Creative Agency users
    for (const user of creativeUsers) {
      await db.collection('posts').insertOne({
        tenant: tenant2.insertedId,
        author: user._id,
        title: `${user.name}'s Creative Post`,
        content: `This is a sample blog post written by ${user.name} from Creative Agency. It contains creative ideas and marketing insights.`,
        status: "published",
        tags: ["creative", "marketing"],
        views: Math.floor(Math.random() * 100),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('✅ Created sample posts for all users\n');

    // ============ PRINT SUMMARY ============
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('                    📊 DATABASE CREATED                      ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('🏢 TENANT 1: TechCorp');
    console.log('┌──────────────────┬─────────────────────┬──────────┬────────┐');
    console.log('│ Name             │ Email               │ Password │ Role   │');
    console.log('├──────────────────┼─────────────────────┼──────────┼────────┤');
    console.log('│ John Admin       │ john@techcorp.com   │ john123  │ admin  │');
    console.log('│ Sarah Admin      │ sarah@techcorp.com  │ sarah123 │ admin  │');
    console.log('│ Mike Developer   │ mike@techcorp.com   │ mike123  │ user   │');
    console.log('│ Emily Designer   │ emily@techcorp.com  │ emily123 │ user   │');
    console.log('│ Alex Tester      │ alex@techcorp.com   │ alex123  │ user   │');
    console.log('└──────────────────┴─────────────────────┴──────────┴────────┘\n');

    console.log('🏢 TENANT 2: Creative Agency');
    console.log('┌──────────────────┬─────────────────────┬──────────┬────────┐');
    console.log('│ Name             │ Email               │ Password │ Role   │');
    console.log('├──────────────────┼─────────────────────┼──────────┼────────┤');
    console.log('│ Lisa Director    │ lisa@creative.com   │ lisa123  │ admin  │');
    console.log('│ Tom Manager      │ tom@creative.com    │ tom123   │ admin  │');
    console.log('│ Rachel Writer    │ rachel@creative.com │ rachel123│ user   │');
    console.log('│ Chris Artist     │ chris@creative.com  │ chris123 │ user   │');
    console.log('│ Diana Social     │ diana@creative.com  │ diana123 │ user   │');
    console.log('└──────────────────┴─────────────────────┴──────────┴────────┘\n');

    console.log('════════════════════════════════════════════════════════════');
    console.log('  ✅ Setup complete! Start the server and login.           ');
    console.log('════════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();