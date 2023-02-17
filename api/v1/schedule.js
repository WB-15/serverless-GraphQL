const AWS = require('aws-sdk');

const jsonData = {
  "start": "2023-02-09T16:58:40",
  "end": "2023-02-09T17:58:40",
  "videoName": "Rapunzel"
}

const { schedule } = require("./dynamoDB");


const schedule_send = async (start, end, videoname) => {
	var schedule_info = {
		"start": start,
		"end": end,
		"videoName": videoname
	}
	var result = schedule(schedule_info);
	return result;
}

module.exports = {
	schedule_send
}
