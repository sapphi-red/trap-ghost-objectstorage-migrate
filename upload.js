const klaw = require('klaw')
const path = require('path')
const { createReadStream } = require('fs')
const pkgcloud = require('pkgcloud')
const config = require('./config.json')
const doneFiles = require('./files.json')

module.exports = async () => {
  const containerName = config.container
  const client = pkgcloud.storage.createClient({
    provider: 'openstack',
    username: config.username,
    password: config.password,
    authUrl: config.authUrl,
    region: config.region,
    tenantId: config.tenantId,
    container: config.container
  })

  //client.getFiles(containerName, (err, files) => console.log(JSON.stringify(files.map(file => file.name))))

  const files = []
  await new Promise(resolve => {
    klaw('./data')
      .on('data', item => {
        if (item.stats.isDirectory()) return
        files.push(item.path)
      })
      .on('end', resolve)
  })

  for (const file of files) {
    const filePath = path
      .relative(path.join(__dirname, 'data/images'), file)
      .replace(/\\/g, '/')

    if (filePath === 'README.md') continue
    if (doneFiles.includes(filePath)) continue

    await new Promise(resolve => {
      const readStream = createReadStream(file)
      const writeStream = client.upload({
        container: containerName,
        remote: filePath
      })
      writeStream.on('error', err => {
        console.error(err)
        resolve()
      })
      writeStream.on('success', file => {
        console.log('Uploaded:', filePath)
        resolve()
      })
      readStream.pipe(writeStream)
    })
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
  }
}
