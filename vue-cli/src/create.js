const fs = require('fs');
const path = require('path');

const axios = require('axios');
const org = require('ora');
const Inquirer = require('inquirer');
const { promisify } = require('util');

let downloadGitRepo = require('download-git-repo');
downloadGitRepo = promisify(downloadGitRepo);

let ncp = require('ncp');
ncp = promisify(ncp);

const { downloadDirectory } = require('./constants');
const cons = require('consolidate');

// 获取项目列表
const fetchRopeList = async () => {
  const { data } = await axios.get('https://api.github.com/orgs/td-cli/repos');
  return data;
}

// 获取版本列表
const fetchTagList = async repo => {
  const { data } = await axios.get(`https://api.github.com/repos/td-cli/${repo}/tags`);
  return data;
}

// 下载项目
const download = async (repo, tag) => {
  let api = `td-cli/${repo}`;
  if (tag) {
    api += `#${tag}`;
  }
  const dest = `${downloadDirectory}/${repo}`;
  await downloadGitRepo(api, dest);
  return dest;
}

// 封装loading效果
const waitFnloading = (fn, message) => async (...args) => {
  const spinner = org(message);
  spinner.start();
  const result = await fn(...args);
  spinner.stop();
  return result;
}

module.exports = async (projectName) => {
  let repos = await waitFnloading(fetchRopeList, 'fetching template...')();
  repos = repos.map(item => item.name);
  const { repo } = await Inquirer.prompt({
    // 返回选择后的结果
    name: 'repo',
    // 显示方式
    type: 'list',
    // 提示
    message: 'please choise a template to create project',
    // 数据源
    choices: repos,
  })
  let tags = await waitFnloading(fetchTagList, 'fetching tags...')(repo);
  tags = tags.map(item => item.name);
  const { tag } = await Inquirer.prompt({
    name: 'tag',
    type: 'list',
    message: 'please choise a tag to create project',
    // 数据源
    choices: tags,
  })
  const dest = await waitFnloading(download, 'download template...')(repo, tag);
  
  // 拷贝文件
  await ncp(dest, path.resolve(projectName))
}