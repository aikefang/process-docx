let fs = require('fs')
let path = require('path')
let mammoth = require("mammoth")
let qiniuTool = require('qiniu-tool')
let uuid = require('node-uuid')
let fnv = require('fnv-plus')
let config = {
  webUrl: '',
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
    zone: '', // 七牛空间（默认Zone_z1）
    pathCDN: '', // 上传到CDN的路径
  }
}
let writeFile = async (pathUrl, buffer) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, pathUrl), buffer, function (err) {
      if (err) {
        console.log(err)
        console.log('文件处理失败')
        resolve(false)
      } else {
        resolve(pathUrl)
      }
    })
  })
}
let base64ToCdn = async (imgData) => {
  let base64Data = imgData.replace(/^data:image\/\w+;base64,/, '')
  // 这里有待优化（使用正则直接匹配）
  let suffix = imgData.split(',')[0].split('/')[1].split(';')[0]
  let dataBuffer = new Buffer(base64Data, 'base64')
  let localPath = await writeFile(`cache-img/${new Date().getTime()}`, dataBuffer)
  qiniuTool.config({
    ...config.qiniu,
    pathLocal: path.join(__dirname, localPath), // 源文件路径（相对路径和绝对路径都行）
    onlyPath: `${fnv.hash(uuid.v1(), 64).str()}.${suffix}`, // 文件名称
  })
  let cdnResult = await qiniuTool.uploadOnly()
  fs.unlink(path.join(__dirname, localPath), function () {})
  return cdnResult
}

let getHtml = async (docxPath) => {
  return new Promise((resolve, reject) => {
    mammoth.convertToHtml({
      path: docxPath
    })
      .then(async result => {
        let html = result.value; // The generated HTML
        // let messages = result.messages // Any messages, such as warnings during conversion
        let r1 = /<img\b.*?(?:\>|\/>)/ig
        let r2 = /\bsrc\b\s*=\s*[\'\"]?([^\'\"]*)[\'\"]?/i
        let obj = {}
        let html2 = html.replace(r1, (res) => {
          obj[res.match(r2)[1]] = ''
          return res
        })
        for (let item in obj) {
          let rCdn = await base64ToCdn(item)
          if (rCdn) {
            html2 = html2.replace(item, '//' + path.join(config.webUrl, rCdn.key))
          }
        }
        resolve(html2)
      })
      .done()
  })
}

class ProcessDocx {
  config(obj) {
    config = obj
  }
  async toHtml (docxPath) {
    return await getHtml(docxPath)
  }
}
let processDocx = new ProcessDocx()
module.exports = processDocx

