import { unlink } from 'fs';

function deleteFile(filePath) {
  unlink(filePath, err => {
    if (err) throw err;
  });
}

export default {
  deleteFile,
};
