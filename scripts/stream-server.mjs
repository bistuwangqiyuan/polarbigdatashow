import NodeMediaServer from 'node-media-server'
import { existsSync } from 'fs'

const RTMP_PORT = parseInt(process.env.RTMP_PORT || '1935', 10)
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '8000', 10)
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '8443', 10)
const SSL_KEY = process.env.SSL_KEY || './ssl/key.pem'
const SSL_CERT = process.env.SSL_CERT || './ssl/cert.pem'

const hasSSL = existsSync(SSL_KEY) && existsSync(SSL_CERT)

const config = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: HTTP_PORT,
    allow_origin: '*',
    mediaroot: './media',
  },
}

if (hasSSL) {
  config.https = {
    port: HTTPS_PORT,
    key: SSL_KEY,
    cert: SSL_CERT,
  }
}

const nms = new NodeMediaServer(config)

nms.on('preConnect', (_id, args) => {
  console.log(`[connect]   id=${_id}  ip=${args.ip}`)
})

nms.on('prePublish', (_id, streamPath) => {
  console.log(`[publish]   ${streamPath}  id=${_id}`)
})

nms.on('postPublish', (_id, streamPath) => {
  console.log(`[live]      ${streamPath}  id=${_id}`)
})

nms.on('donePublish', (_id, streamPath) => {
  console.log(`[unpublish] ${streamPath}  id=${_id}`)
})

nms.on('prePlay', (_id, streamPath) => {
  console.log(`[play]      ${streamPath}  id=${_id}`)
})

nms.on('donePlay', (_id, streamPath) => {
  console.log(`[stop]      ${streamPath}  id=${_id}`)
})

nms.run()

console.log(`
===========================================================
  光伏监控推流服务器已启动（本地中继备用）
===========================================================
  RTMP 接入端口:  ${RTMP_PORT}
  HTTP-FLV 端口:  ${HTTP_PORT}
  HTTPS-FLV:      ${hasSSL ? `${HTTPS_PORT} (SSL enabled)` : '未启用（需要 ssl/key.pem + ssl/cert.pem）'}
-----------------------------------------------------------
  直播流播放地址 (aczv.asia):
    FLV:    https://aczv.asia/live/stream.flv
    M3U8:   https://aczv.asia/live/stream.m3u8
    RTMP:   rtmp://aczv.asia/live/stream
    WebRTC: webrtc://aczv.asia/live/stream
-----------------------------------------------------------
  本地中继备用:
    推流: rtmp://localhost:${RTMP_PORT}/live/cam1
    播放: http://localhost:${HTTP_PORT}/live/cam1.flv
-----------------------------------------------------------
  ffmpeg 模拟推流测试:
    ffmpeg -re -stream_loop -1 -i test.mp4 -c copy \\
      -f flv rtmp://aczv.asia/live/stream
===========================================================
`)
