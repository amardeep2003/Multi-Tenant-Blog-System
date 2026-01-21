const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multi_tenant_blog');
  
  const db = mongoose.connection.db;
  
  // Find tenant
  const tenant = await db.collection('tenants').findOne({ name: "TechCorp" });
  console.log('Tenant:', tenant ? tenant.name : 'NOT FOUND');
  
  if (!tenant) {
    console.log('Run createAdmin.js first!');
    process.exit(1);
  }
  
  // Find user
  const user = await db.collection('users').findOne({ 
    email: "admin@techcorp.com",
    tenant: tenant._id 
  });
  console.log('User:', user ? user.email : 'NOT FOUND');
  
  if (!user) {
    console.log('User not found!');
    process.exit(1);
  }
  
  // Test password
  const testPassword = 'Admin@123';
  const isMatch = await bcrypt.compare(testPassword, user.password);
  console.log('Password match:', isMatch);
  
  if (isMatch) {
    console.log('\n✅ Login should work! Check frontend/backend connection.');
  } else {
    console.log('\n❌ Password mismatch! Run createAdmin.js again.');
  }
  
  await mongoose.disconnect();
}

testLogin();