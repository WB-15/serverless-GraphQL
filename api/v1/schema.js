const { gql } = require("apollo-server-lambda");

const { getURL } = require("./upload-video");

const { getList } = require("./get-video");

const { createConverter, del_option, del_quality }  = require("./media-converter");

const { schedule_send } = require("./schedule");

const typeDefs = gql`
  type Image {
    source: String # Url scalar
    description: String
    thumbnailSource(width: Int, height: Int): String # Url scalar
  }

  type Upload {
    uploadURL: String
  }

  type List {
    videoList: [Item]!
  }

  type Item {
    Name: String
    ModifiedDate: String
    Size: Float
  }

  type Createconverter {
    Result:String
  }

  type Del_option {
    Result:String
  }

  type Del_quality {
    Result: String
  }

  type Schedule {
    Result:String
  }
   
  type Query {
    upload(fileName: String, runtime: Int): Upload
    list: List
    createconverter(fileName: String, resolution:[String]): Createconverter
    del_option(fileName:String): Del_option,
    del_quality(fileName:String, resolution:String): Del_quality,
    schedule(start:String, end:String, video:String): Schedule
  }
`;

const resolvers = {
  Query: {
    upload(obj, args, context, info) {
      return getURL(args.fileName, args.runtime);
    },
    list() {
      return getList();
    },
    createconverter(obj, args, context, info) {
      return createConverter(args.fileName, args.resolution); 
    },
    del_option(obj, args, context, info) {
      return del_option(args.fileName);
    },
    del_quality(obj, args, context, info) {
      return del_quality(args.fileName, args.resolution);
    },
    schedule(obj, args, context, info) {
      return schedule_send(args.start, args.end, args.video);
    }
  }
};

const mocks = {
    Upload: () => ({
        // link: 'https://s3.upload.com/sfdfsdfsd'
    })
};

module.exports = {
  typeDefs,
  resolvers,
  mocks,
  mockEntireSchema: false,
  context: ({ event, context }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context
  })
};
