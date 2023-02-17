const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' })
const s3 = new AWS.S3({
  accessKeyId: 'AKIATVSGCIYWEXNYKIGK',
  secretAccessKey: '5FSOcKIVEqP56yplgJErxr2sCfYqEhEYFykMRHJT',
})

const uploadBucket = 'upload-files-test-1'  // Replace this value with your bucket name!   

const getList = async () => {
  const params = { 
    Bucket: uploadBucket,
  }

  let list = (params, s3) => {
    return new Promise((resolve, reject) => {
      s3.listObjectsV2(params, function(err, data) {
        if (err) reject(err);
        resolve(data.Contents);
      });
    })
  };

  let result = await list(params, s3);
  let array = [];
  result.forEach((obj) => {
    let temp_obj = {};
    temp_obj = {
      'Name': obj.Key,
      'ModifiedDate': obj.LastModified.toString(),
      'Size': obj.Size/Math.pow(1024,2)
    };
    temp_obj.Size = temp_obj.Size.toFixed(2);
    array.push(temp_obj);
  });

  let res = {
    'videoList' : array
  };
  return res;
}
  
module.exports = {
  getList
};
