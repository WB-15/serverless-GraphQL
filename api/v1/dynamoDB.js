const AWS = require('aws-sdk')

AWS.config.update({ region: process.env.Region });

const dynamo_db = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  accessKeyId: process.env.AccessKey,
  secretAccessKey: process.env.Secretaccesskey,
});

const docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  convertEmptyValues: true,
  accessKeyId: process.env.AccessKey,
  secretAccessKey: process.env.Secretaccesskey,
});

const insertData = async (info) => {

  var params = {
      TableName: 'video_list',
      Item: {
          'ID': {S: info.ID},
          'S3_path': {S: info.S3_path},
          'landscape_image': {L: []},
          'portrait_image': {L: []},
          'back_image': {L: []},
          'resolution': {SS: [" "]},
          'original_url': {S: info.original_url},
          'original_title': {S: info.orginal_title},
          'run_time': {N: `${info.runtime}`},
          'status': {S: " "},
          'url_240': {S: " "},
          'url_360': {S: " "},
          'url_480': {S: " "},
          'url_720': {S: " "},
          'url_1080': {S: " "},
          'url_2160': {S: " "},
      }
  };

  await dynamo_db.putItem(params).promise()
    .then(() => {
      console.log("upload info success inserted!");
    })
    .catch((err) => {
      console.log("some err occured!", err);
      return err;
    });
}

const updateInfo = async (videoName, resolution) => {

  var get_param = {
          TableName: 'video_list',
          FilterExpression: 'original_title = :condition',
          ExpressionAttributeValues: {
            ":condition": videoName
          }
  };

  var get_result;

  await docClient.scan(get_param).promise()
    .then((result) => {
      get_result = result.Items[0].ID;
    })
    .catch((err) => {
      console.log("get err:", err);
    });

  var videoname = videoName;
  var resolution = resolution;

  var params = {
    TableName: 'video_list',
    Key: {
      'ID' : get_result
    },
    UpdateExpression: 'set resolution = :R',
    ExpressionAttributeValues: {
      ':R' : resolution,
    }
  };

  return await docClient.update(params).promise()
    .then((result) => {
      console.log("update success", result);
    })
    .catch((err) => {
      console.log("err:", err);
    });
}

const getID = async(videoname) => {

  var ID;
  var get_param = {
          TableName: 'video_list',
          FilterExpression: 'original_title = :condition',
          ExpressionAttributeValues: {
            ":condition": videoname
          }
  };

  await docClient.scan(get_param).promise()
  .then((result) => {
    ID = result.Items[0].ID;
  })
  .catch((err) => {
    console.log("get err:", err);
  });

  return ID;

}

const schedule = async (info) => {
  var res

  var cur_time = new Date().toISOString();
  var arr = cur_time.split("T");
  var date = arr[0]

  var ID = Date.now().toString();



  var start_time = info.start;
  var end_time = info.end;
  var videoName = info.videoName;

  var params = {
  TableName: 'schedule',
  Item: {
      'S_ID': {S: ID},
      'date': {S: date},
      'start_time': {S: start_time},
      'end_time': {S: end_time},
      'videoName': {S: videoName}
  }
  };

  await dynamo_db.putItem(params).promise()
    .then(() => {
      console.log("success inserted!");
      res = {
        'Result': "success inserted!"
      }
    })
    .catch((err) => {
      console.log("some err occured!", err);
      res = {
        'Result': `errors:${err}`
      }
  });

  return res;
}


module.exports = {
  insertData,
  updateInfo,
  schedule,
  getID,
}
