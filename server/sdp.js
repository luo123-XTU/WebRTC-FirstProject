//import { emit } from "emit";
import { Server, Socket } from "socket.io"

/**
 * @type {Map<string,number>}
 */
const roomMap = new Map();

/**
 * 
 * @param {Server} io 
 */
export  const  initSDPServer = (io) =>{
    //客户端连接
    io.on(`connection`,(socket)=>{
        onEvent(socket)
    })
}
/**
 * 
 * @param {Socket} socket 
 */
const onEvent = (socket=>{
    let { roomId,userId} = socket.request._query;
    console.log(roomId,userId);
    //无房则创建房间，有则人+1
    if(!roomMap.get(roomId)){
        roomMap.set(roomId,1);
    }else{
        roomMap.set(roomId,roomMap.get(roomId)+1);
    }
    console.log("新用户加入：房间总人数",roomMap.get(roomId));
    //监听用户离开
    socket.on("disconnect",()=>{
        console.log("Client discinnected");
        //广播
        socket.to(roomId).emit("client-leave",userId+":leave");
        roomMap.set(roomId,roomMap.get(roomId)-1);
        console.log("用户离开房间：房间总人数",roomMap.get(roomId));
    })
    //人满
    if(roomMap.get(roomId)>2){
        socket.emit("room-full",true)
        return
    }
    //将socket对象加入到roomid这个房间里面
    socket.join(roomId);
    //告诉前端人数
    socket.emit("people-count-msg",roomMap.get(roomId));
    socket.to(roomId).emit("people-count-msg",roomMap.get(roomId));

    socket.on('offer-sdp-msg', (offerSDP) => {
        socket.to(roomId).emit("offer-sdp-msg", offerSDP)
    })
    socket.on('answer-sdp-msg', (answerSDP) => {
        socket.to(roomId).emit("answer-sdp-msg", answerSDP)
     })
    socket.on('candidate-msg', (candidate) => {
        socket.to(roomId).emit("candidate-msg", candidate)
    })

})