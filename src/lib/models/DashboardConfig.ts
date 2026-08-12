import mongoose from 'mongoose';

const dashboardConfigSchema = new mongoose.Schema({
  _id: { type: String, default: 'dashboard_config' },
  vipUsers: { type: [String], default: [] },
  validCodes: { type: [String], default: [] },
  vipPlusUsers: { type: [String], default: [] },
  validPlusCodes: { type: [String], default: [] },
  vipBackgrounds: { type: Map, of: String, default: {} }
}, { collection: 'vip_data' });

const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model('DashboardConfig', dashboardConfigSchema);

export default DashboardConfig;
