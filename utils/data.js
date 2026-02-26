function createId(prefix = 'c') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

module.exports = {
  createId
};
