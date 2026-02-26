const { createId } = require('./data');

const KEY_CUSTOMERS = 'MM_CUSTOMERS_V1';
const KEY_PROFILE = 'MM_PROFILE_V1';
const KEY_CLEANED_MOCK = 'MM_CLEANED_MOCK_V1';

const DEFAULT_PROFILE = {
  title: '',
  phone: ''
};

function ensureSeedData() {
  // Deprecated: mock seeding removed. Keep as a no-op for compatibility.
}

function cleanupMockDataIfNeeded() {
  try {
    const cleaned = wx.getStorageSync(KEY_CLEANED_MOCK);
    if (cleaned) return;

    const existing = wx.getStorageSync(KEY_CUSTOMERS);
    if (Array.isArray(existing) && existing.length) {
      const seedIds = new Set([
        'm_zhangsan',
        'm_liqiang',
        'm_wanglei',
        'f_wangfang',
        'f_zhaoli',
        'f_lina',
        'f_chenjing'
      ]);

      const hasSeed = existing.some((c) => c && seedIds.has(c.id));
      if (hasSeed) {
        wx.removeStorageSync(KEY_CUSTOMERS);
        wx.removeStorageSync(KEY_PROFILE);
      }
    }

    wx.setStorageSync(KEY_CLEANED_MOCK, 1);
  } catch (e) {
    // ignore
  }
}

function getProfile() {
  const p = wx.getStorageSync(KEY_PROFILE);
  if (!p || typeof p !== 'object') return { ...DEFAULT_PROFILE };
  return { ...DEFAULT_PROFILE, ...p };
}

function setProfile(nextProfile) {
  wx.setStorageSync(KEY_PROFILE, { ...getProfile(), ...nextProfile });
}

function getCustomers() {
  return wx.getStorageSync(KEY_CUSTOMERS) || [];
}

function setCustomers(customers) {
  wx.setStorageSync(KEY_CUSTOMERS, customers);
}

function getCustomerById(id) {
  return getCustomers().find((c) => c.id === id) || null;
}

function upsertCustomer(customer) {
  const customers = getCustomers();
  const now = Date.now();

  const normalized = {
    id: customer.id || createId(customer.gender === 'female' ? 'f' : 'm'),
    gender: customer.gender,
    name: (customer.name || '').trim(),
    age: Number(customer.age) || '',
    region: (customer.region || '').trim(),
    marital: customer.marital || '未婚',
    job: (customer.job || '').trim(),
    family: (customer.family || '').trim(),
    note: (customer.note || '').trim(),
    photo: customer.photo || '',
    updatedAt: now
  };

  const idx = customers.findIndex((c) => c.id === normalized.id);
  if (idx >= 0) {
    customers[idx] = { ...customers[idx], ...normalized };
  } else {
    customers.unshift({ ...normalized, createdAt: now });
  }

  setCustomers(customers);
  return normalized.id;
}

function deleteCustomer(id) {
  const customers = getCustomers().filter((c) => c.id !== id);
  setCustomers(customers);
}

function getStats() {
  const customers = getCustomers();
  const male = customers.filter((c) => c.gender === 'male').length;
  const female = customers.filter((c) => c.gender === 'female').length;
  return {
    total: customers.length,
    male,
    female
  };
}

function recommendMatches(targetCustomer, limit = 5) {
  const customers = getCustomers();
  if (!targetCustomer) return [];

  const targetAge = Number(targetCustomer.age) || 0;
  if (!targetAge) return [];

  const opposite = customers.filter((c) => c.gender !== targetCustomer.gender);
  const filtered = opposite
    .map((c) => {
      const age = Number(c.age) || 0;
      const ageDiff = Math.abs(age - targetAge);
      const sameRegion = c.region && targetCustomer.region && c.region === targetCustomer.region ? 1 : 0;
      return { c, ageDiff, sameRegion };
    })
    .filter((x) => x.ageDiff <= 2)
    .sort((a, b) => a.ageDiff - b.ageDiff || b.sameRegion - a.sameRegion || (b.c.updatedAt || 0) - (a.c.updatedAt || 0));

  return filtered.slice(0, limit).map((x) => x.c);
}

module.exports = {
  ensureSeedData,
  cleanupMockDataIfNeeded,
  getProfile,
  setProfile,
  getCustomers,
  setCustomers,
  getCustomerById,
  upsertCustomer,
  deleteCustomer,
  getStats,
  recommendMatches
};
