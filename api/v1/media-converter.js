const AWS = require('aws-sdk');
const { updateInfo, getID } = require("./dynamoDB");
const jsonData = require('./../../json/job.json');

require('dotenv').config();

const mediaconvert = new AWS.MediaConvert({
  accessKeyId: process.env.AccessKey,
  secretAccessKey: process.env.Secretaccesskey,
  apiVersion: '2017-08-29',
  endpoint : 'https://vasjpylpa.mediaconvert.us-east-1.amazonaws.com'
});


const Original_bucket = process.env.Original_bucket_name; 
const Transcoded_bucket = process.env.Transcoded_bucket_name;

const resolution = ["426x240", "640x360", "640x480", "1280x720", "1920x1080", "3840x2160"]

const createConverter = async (filename, resolution) => {

  let msg = " ", res, ID;
  let converted = [];

  let create = (params) => {
    return new Promise((resolve, reject) => {
      mediaconvert.createJob(params, function(err, data) {
        if (err) {reject(err); console.log("ERR", err);}
        else {resolve(data); console.log("Success", data);}
      });
    });
  }

  let allowed = (param) => {
    for( let i=0; i<resolution.length; i++){
      if(param == resolution[i]) return true;
    }
    return false;
  }

  ID = await getID(filename);

  for(let i = 0; i < resolution.length; i++) {
    let job_tmp;

    if(allowed(resolution[i]) == true){

      let width, height;
      let tmp_arr = resolution[i].split("x");

      width = parseInt(tmp_arr[0]);
      height = parseInt(tmp_arr[1]);
      
      job_tmp = jsonData;

      job_tmp.Settings.OutputGroups[0].Outputs[0].VideoDescription.Width = width;
      job_tmp.Settings.OutputGroups[0].Outputs[0].VideoDescription.Height = height;
      job_tmp.Settings.OutputGroups[0].CustomName = resolution[i];
      job_tmp.Settings.OutputGroups[0].Outputs[0].NameModifier = `_${resolution[i]}`;
      job_tmp.Settings.OutputGroups[0].OutputGroupSettings.HlsGroupSettings.Destination = `s3://${Transcoded_bucket}/`+`assets/${ID}/hls/`+`${resolution[i]}/`;
      job_tmp.Settings.Inputs[0].FileInput = `s3://${Original_bucket}/assets/${ID}/mp4/`+`${filename}.mp4`;

      job_tmp.Settings.OutputGroups[1].Outputs[0].VideoDescription.Width = width;
      job_tmp.Settings.OutputGroups[1].Outputs[0].VideoDescription.Height = height;
      job_tmp.Settings.OutputGroups[1].Outputs[0].NameModifier = `_${resolution[i]}_thumbnail`
      job_tmp.Settings.OutputGroups[1].OutputGroupSettings.FileGroupSettings.Destination = `s3://${Transcoded_bucket}/`+`assets/${ID}/hls/`+`${resolution[i]}/thumbnail/`;
     
      await create(job_tmp)
      .then(() => {
        msg += `${resolution[i]}_job success,`;
        converted.push(resolution[i]);
        console.log("converted value!", converted);
      })
      .catch((err) => {
        console.log(`${resolution[i]}_job err`, err);
      });
    } else {
      console.log(`${resolution[i]}:This resolution is not allowed!`);
      msg += `${resolution[i]}_resolution is not allowed!,`;
    }
  }

  updateInfo(filename, converted);

  res = {
    'Result' : msg
  }

  return res;
}

const del_option = async (filename) => {
  var res

  var s3 = new AWS.S3();
  AWS.config.update({ region: 'us-east-1' })
  var s3 = new AWS.S3({
    accessKeyId: 'AKIATVSGCIYWEXNYKIGK',
    secretAccessKey: '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',
  })

  var full_dir = `${filename}/`+ `${filename}.mp4`

  var bucket_params = {  Bucket: bucket_name, Key: full_dir};

  let delete_file = (param) => {
    return new Promise((resolve, reject) => {
      s3.deleteObject(param, function(err, data) {
        if (err) { reject(err); console.log("delete err:", err); }
        else { resolve(data); console.log("delete success!");}
      });
    });
  }

  await delete_file(bucket_params)
    .then((result) => {
      res = {
        'Result' : 'Success deleted!'
      }
      console.log("success deleted!");
    })
    .catch((err) => {
        res = {
          'Result':"Error occured!"
        }
        console.log("some errors!", err);
    })
  return res;
}

const del_quality = async (filename, resolution) => {
  var res

  var s3 = new AWS.S3();
  AWS.config.update({ region: 'us-east-1' })
  var s3 = new AWS.S3({
    accessKeyId: 'AKIATVSGCIYWEXNYKIGK',
    secretAccessKey: '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',
  })

  var full_dir = `${filename}/`+ `${resolution}/`

  var bucket_params = {  Bucket: bucket_name, Key: full_dir};
  let delete_folder = (param) => {
    return new Promise((resolve, reject) => {
      s3.deleteObject(param, function(err, data) {
        if (err) { reject(err); console.log("delete err:", err); }
        else { resolve(data); console.log("delete success!");}
      });
    });
  }


    var emptyS3Directory = async(bucket, dir) => {
      let listParams = {
          Bucket: bucket,
          Prefix: dir
      };

      let listedObjects = await s3.listObjectsV2(listParams).promise();

      if (listedObjects.Contents.length === 0) return;

      let deleteParams = {
          Bucket: bucket,
          Delete: { Objects: [] }
      };

      listedObjects.Contents.forEach(({ Key }) => {
          deleteParams.Delete.Objects.push({ Key });
      });

      await s3.deleteObjects(deleteParams).promise();

      if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
    }



  await emptyS3Directory(bucket_name, full_dir)
    .then(() => {
      res = {
        'Result' : 'Success deleted!'
      }
      console.log("success deleted!");
    })
    .catch((err) => {
        res = {
          'Result':"Error occured!"
        }
        console.log("some errors!", err);
    });
  return res;

}

module.exports = {
    createConverter,
    del_option,
    del_quality
}
