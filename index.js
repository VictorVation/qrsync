#!/usr/bin/env node

const fs = require('fs')
const os = require('os')
const http = require('http')

const chalk = require('chalk')
const qrcode = require('qrcode-terminal')

const filename = process.argv[2]
if (!filename) {
  console.log(`qrcp - Transfer files via QR code through the local network.
Usage:
  qrcp <filename>`)
  process.exit(0)
}

const stat = fs.statSync(filename)
if (stat.isDirectory()) {
  console.log(`Skipping directory ${filename}.`)
  process.exit()
}

const server = http
  .createServer((req, res) => {
    res.writeHead('200', {
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename=' + filename,
    })
    fs
      .createReadStream(filename)
      .on('close', () => process.exit())
      .pipe(res)
  })
  .listen()

server.on('listening', () => {
  const uri = 'http://' + os.hostname + ':' + server.address().port
  console.log(chalk`
{yellow ${filename} is now temporarily available on your local network!
Scan the following QR code to download the file, or visit} {cyan.underline ${uri}}{yellow .}
{yellow Make sure your phone is connected to the same WiFi network as this computer.}
`)
  qrcode.generate(uri)
})