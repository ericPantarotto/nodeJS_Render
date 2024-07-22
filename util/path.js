import path from 'path';

// WARN: export default path.dirname(require.main.filename);
// FIX: for ES module
export default path.dirname(process.argv[1]);
