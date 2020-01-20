const cmd = process.argv[2]

if (cmd === 'opt') {
  // image optimize
  require('./optimize')()
} else if (cmd === 'upload') {
  // file upload
  require('./upload')()
} else {
  console.error('unknown command args')
}
