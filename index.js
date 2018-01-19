var express = require('express');
var app = express();
var path = require('path');
var exec_old = require('exec');
var bodyParser = require('body-parser');
var fs = require("fs");
const { exec } = require('child_process');
var responseObject;


app.use(function(req, res, next){
  var data = "";
  req.on('data', function(chunk){ data += chunk})
  req.on('end', function(){
      req.rawBody = data;
      next();
  })
})

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

app.post('/getStuff/:uuid', function (req, res) {
  var filename = "/tmp/" + req.params.uuid + "out.jpg";
  base64Data = decodeBase64Image(req.rawBody);
  console.log(filename);
  fs.writeFile(filename, base64Data.data, function (err) {
    if (err) { console.log(err); res.send('error'); return; }
    checkFile2(filename, res);
  });
})

function checkFile2(filename, res) {
  let command = "/Users/debarko/projects/im2txt/models/research/im2txt/bazel-bin/im2txt/run_inference --checkpoint_path='/Users/debarko/projects/im2txt/Pretrained-Show-and-Tell-model/model.ckpt-2000000' --vocab_file='/Users/debarko/projects/im2txt/Pretrained-Show-and-Tell-model/word_counts.txt' --input_files=" + filename;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    res.send(stdout);
  });
}

function checkFile(filename, res) {
  dir = exec_old("/Users/debarko/projects/im2txt/models/research/im2txt/bazel-bin/im2txt/run_inference --checkpoint_path='/Users/debarko/projects/im2txt/Pretrained-Show-and-Tell-model/model.ckpt-2000000' --vocab_file='/Users/debarko/projects/im2txt/Pretrained-Show-and-Tell-model/word_counts.txt' --input_files=" + filename, function (err, stdout, stderr) {
    if (err) {
      // should have err.code here?  
      console.log(err);
      return res.send('Something went wrong');
    }
    console.log(stdout);
    console.log(1);
    return res.send('debarko');

  });

  dir.on('exit', function (code) {
    console.log('done');
    // exit code is code
  });

}


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/talkify.min.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/talkify.min.js'));
})

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})