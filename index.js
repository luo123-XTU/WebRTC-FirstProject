import express from "express";
import fs from "fs";
import https from "https";
import path from "path";
import { getIpAddress } from "./utils/common.js";
import { Server } from "socket.io";
import { initSDPServer } from "./server/sdp.js";


const app = express();
//静态文件目录
app.use(express.static("./public"))
/**
 * 浏览器调用摄像头信息
 * 要求
 *  本地文件打开
 *   localhost:端口
 *   127.0.0.1:端口
 *   https:xxx:端口 -> OK ->支持http协议，有ssl,证书
 * http:xxx.xx.com拿不到摄像头信息
 */
const options = {
    key:fs.readFileSync(path.resolve("./ssl/server.key")),
    cert:fs.readFileSync(path.resolve("./ssl/server.crt"))
}
const httpsServer = https.createServer(options,app);

const io = new Server(httpsServer,{allowEIO3:true,cors:true});
/**
 * 兼容性和跨域
 */
initSDPServer(io);

httpsServer.listen(3000,()=>{
    let str = getIpAddress() ? `https://${getIpAddress()}:3000 `: `当前网络不可用`
    console.log(str);
})

