const mongoose = require('mongoose');
let dbConn, testSchema, testModel;

describe('\'mongoose\' mongoose model', () => {
  beforeAll (() => {
    dbConn = mongoose.createConnection(
      'mongodb://localhost:27017/zeros',
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );

    testSchema = new mongoose.Schema({
      title:  String,
      author: String,
      body:   String,
      comments: [{ body: String, date: Date }],
      date: { type: Date, default: Date.now },
      hidden: Boolean,
      meta: {
        votes: Number,
        favs:  Number
      }
    }, {
      toObject: {
        transform (doc, ret) {
          delete ret._id;
          delete ret.__v;
        }
      }
    });

    testModel = dbConn.model('test_mongoose_models', testSchema);
  });

  afterAll (async () => {
    await dbConn.dropCollection('test_mongoose_models');
    await dbConn.close(true);
  });

  it('execute a query', async () => {
    let doc = await testModel.create({
      title: 'hehe'
    });
    let docs = await testModel.find({}).lean(false);

    console.log(docs, docs[0]._id, typeof docs[0].toObject);

    console.log('doc ---------->', doc);

    await testModel.remove({});
  });
});
