const { downloadFiles } = require('./download');

const data = [
  'https://img.ichamet.com/aliyun_ossphotos/2019/10/26/18/pic_1572085511011_2566914f-4494-4475-ae64-a10495c4d403.png',
  'https://img.ichamet.com/aliyun_ossphotos/2019/10/26/18/pic_1572085525909_b2ca0275-20be-4a26-943a-9f28304aa20f.png',
]

downloadFiles(data, './download/');