const AWS = require('aws-sdk')
const { getList } = require("./get-video");
const { insertData } = require("./dynamoDB");
const { v4: uuidv4 } = require("uuid");

require('dotenv').config();


AWS.config.update({ region: process.env.Region });

const s3 = new AWS.S3({
  accessKeyId: process.env.AccessKey,
  secretAccessKey: process.env.Secretaccesskey,
  signatureVersion: 'v4',
  ACL: "public-read"
});

const Original_bucket = process.env.Original_bucket_name; 
const URL_EXPIRATION_SECONDS = 30000   

const getURL = async (fileName, runtime) => {

  var Key, S3_path
  var date = new Date().toJSON();
  var ID = uuidv4();

  var tmp = fileName;
  var filename = "";
  var arr = fileName.split(" ");

  if(arr.length == 1){
    filename = tmp;
  } else {
    for(let i=0; i<arr.length; i++){
      if(i<arr.length-1) {
        filename += `${arr[i]}-`
      } else {
        filename += `${arr[i]}`
      }
    }
  }
  
  Key = "assets/"+`${ID}/`+"mp4/"+`${filename}.mp4`
  S3_path ="assets/"+`${ID}/`+"mp4"

  var s3Params = {
    Bucket: Original_bucket,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: 'video/mp4'
  }

  await s3.getSignedUrlPromise('putObject', s3Params)
  .then(async (data) => {

    var Info = {
      'ID': ID,
      'S3_path': S3_path,
      'original_url': data,
      'orginal_title': filename,
      'runtime': runtime
    }

    await insertData(Info);

    res = {
    "uploadURL": data
    }

  })

  return res
};
  
module.exports = {
  getURL
};