const klaw = require('klaw')
const fileType = require('file-type')
const path = require('path')
const fs = require('fs').promises
const sharp = require('sharp')

const canTransformFileExtension = ext =>
  !['.gif', '.svg', '.svgz', '.ico'].includes(ext)

const processImg = async (options = {}) => {
  const originalBuffer = await fs.readFile(options.in)
  const resizedBuffer = await sharp(originalBuffer)
    .resize({
      width: options.width,
      withoutEnlargement: true
    })
    .rotate()
    .toBuffer()
  const buffer = resizedBuffer.length < originalBuffer.length ? resizedBuffer : originalBuffer;
  return fs.writeFile(options.out, buffer)
}

module.exports = () => {
  klaw('./data')
    .on('readable', async function () {
      let item
      while ((item = this.read())) {
        if (item.stats.isDirectory()) continue

        let type
        try {
          type = await fileType.fromFile(item.path)
        } catch (e) {
          continue
        }
        if (!type || !type.mime.includes('image')) continue

        const ext = path.extname(item.path)
        const nameWithoutExt = item.path.slice(0, -ext.length)
        if (!canTransformFileExtension(ext)) continue

        if (nameWithoutExt.slice(-2) === '_o') {
          try {
            const stat = await fs.stat(nameWithoutExt.slice(0, -2) + ext)
            if (stat.isFile()) continue
          } catch (e) {/* */}
        }

        const newName = `${nameWithoutExt}_o${ext}`

        try {
          const stat = await fs.stat(newName)
          if (stat.isFile()) continue
        } catch (e) {/* */}

        const out = `${item.path}_processed`
        const originalPath = item.path
        const options = {
          in: originalPath,
          out,
          ext,
          width: 2000
        }

        try {
          await processImg(options)

          await fs.rename(item.path, newName)
          await fs.rename(out, item.path)

          console.log('Optimized:', path.relative(path.join(__dirname, 'data'), item.path))
        } catch (e) {
          console.error(path.relative(path.join(__dirname, 'data'), item.path), e)
        }
      }
    })
}
