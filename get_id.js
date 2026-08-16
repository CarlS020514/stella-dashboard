const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://dantebot:dantebot123@cluster0.r3zlio4.mongodb.net/stella_dashboard');
  const db = mongoose.connection.db;
  const config = await db.collection('vip_data').findOne({ _id: 'dashboard_config' });
  console.log("VIP+ Users:", config.vipPlusUsers);
  process.exit(0);
}
run();
