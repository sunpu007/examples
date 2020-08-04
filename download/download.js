'use strict';

const ProgressBar = require('progress');
const https = require('https');
const http = require('http');
const fs = require('fs');
const Path = require('path');
const URL = require('url');

/**
 * 下载单个文件
 * @param {String} fileUrl 网络文件路径
 * @param {String} path 文件存放位置
 * @param {String} fileName 文件名
 */
const downloadFile = (fileUrl, path, fileName) => {
  fileName = fileName ? fileName : Path.basename(fileUrl);
  path = path ? path : './';
  const stream = fs.createWriteStream(path + fileName);

  const url = URL.parse(fileUrl);
  let req = null;
  if (url.protocol === 'http:') req = http.request(url);
  if (url.protocol === 'https:') req = https.request(url);

  req.on('response', (res) => {
    const len = parseInt(res.headers['content-length'], 10);

    const bar = new ProgressBar(`downloading ${fileName} [:bar] :rate/bps size: ${len}KB :percent :etas`, {
      complete: '=',
      incomplete: '-',
      width: 100,
      total: len,
    })
  
    res.on('data', chunk => {
      bar.tick(chunk);
      stream.write(chunk, 'utf-8');
    })
  
    res.on('end', _ => {
      console.log('/n')
      stream.end();
    })

    res.on('error', err => {
      console.error(err);
    })
  })
  req.end();
}

/**
 * 下载多个文件
 * @param {String[]} fileUrls 网络文件路径数组
 * @param {String} path 文件存放位置
 */
const downloadFiles = (fileUrls, path) => {
  if (fileUrls && fileUrls.length === 0) throw new Error('fileUrls cannot be empty');
  path = path ? path : './';

  fileUrls.forEach(url => {
    downloadFile(url, path)
  })
}

module.exports = {
  downloadFile,
  downloadFiles,
}
