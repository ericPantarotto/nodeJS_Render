import { MongoClient } from 'mongodb';

let _db;
const mongoConn = cb => {
  const client = new MongoClient(process.env.MONGO_DB_URL);
  client
    .connect()
    .then(client => {
      console.log('Connected to mongodb Atlas');
      _db = client.db();
      cb();
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) return _db;
  throw 'No Database found';
};

export  const mongoConnect = mongoConn ;
export { getDb };
