## 示例
```
let processDocx = require('process-docx')
processDocx.config({
  webUrl: 'static.webascii.cn', // 不要带http://
  qiniu: {
    ak: '', // 七牛AccessKey
    sk: '', // 七牛SecretKey
    scope: '', // 七牛存储空间名称
    /**
     * 机房  Zone对象
     * 华东  qiniu.zone.Zone_z0
     * 华北  qiniu.zone.Zone_z1
     * 华南  qiniu.zone.Zone_z2
     * 北美  qiniu.zone.Zone_na0
     */
    zone: 'Zone_z1', // 七牛空间（默认Zone_z1）
    pathCDN: 'test/', // 上传到CDN的路径
  }
})
let demo = async () => {
  console.log(await processDocx.toHtml('demo.docx'))
}
demo()
// 转换结果
// <p><img src="//static.webascii.cn/test/p0563ddjxabj.png" /><img src="//static.webascii.cn/test/2fgxffe6slzcf.png" /></p>
```