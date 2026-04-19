import { createPeerConnection, createVideoEle, getLocalMediaStream, getLocalScreenMediaStream, setLocalVideoStream, setRemoteVideoStream } from './utils/common.js'
import {io} from './utils/socket.io.esm.min.js'

const roomInput = document.querySelector("#roomId")
const userInput = document.querySelector("#userId")
const startBtn = document.querySelector('.startBtn')
const stopBtn = document.querySelector('.stopBtn')
const videoBtn = document.querySelector('.videoBtn');
const screenBtn = document.querySelector('.screenBtn');

let offerVideo = document.querySelector('#offerVideo');

let localStream = await getLocalMediaStream({
    video:true,audio:true
})

setLocalVideoStream(offerVideo,localStream);

//人数是否满
let isRoomFull = false;
//房间号和用户名
let roomId;
let userId;
//socket对象
let client;
let serverUrl = "wss://172.25.49.56:3000/"
//第一次加入
let isInited = false;

/**
 * @type {RTCPeerConnection}
 */
let peer;

let isStopAudio = false;
let isStopVideo = false;

startBtn.addEventListener("click",()=>{
    if(isRoomFull){
        alert("房间人数已满");
        return
    }
    roomId = roomInput.value;
    userId = userInput.value;
    if(!client){
        client = new io(serverUrl,{
            reconnectDelayMat: 10000,
            transports: ["websocket"],
            query: {
             roomId,
             userId
            }
        })
    }
    client.on("connect",()=>{
        console.log("Connection successful");
    })
    client.on("disconnect",()=>{
        console.log("Connection disconnected");
    })
    client.on("error",()=>{
        console.log("Connection error");
    })
    //有人加入创建peerconnection
    client.on("people-count-msg",async (count)=>{
        console.log("count",count);
        if(count==1){
            isInited = true;
        }
        peer = createPeerConnection();
        localStream.getTracks().forEach(track=>{
            peer.addTrack(track,localStream);
        })
        /**
         * 
         * @param {RTCPeerConnectionIceEvent} event 
         */
        peer.onicecandidate = event =>{
            //媒体协商成功
            if(event.candidate){
                client.emit("candidate-msg",event.candidate);
            }
        }
        /**
         * 
         * @param {RTCTrackEvent} event 
         */
        peer.ontrack = event =>{
            //建立p2p成功
            //获取对方音视频信息，设置给本地video
            console.log("6. AB连接成功p2p");
            let videoEle = createVideoEle(count);
            setRemoteVideoStream(videoEle,event.track);

        }
        if(!isInited){
            //b触发事件
            let offerSDP = await peer.createOffer();
            await peer.setLocalDescription(offerSDP);

            console.log("B发送给A offerSDP");
            client.emit("offer-sdp-msg",offerSDP);
        }
        isInited =true;
    })
    
    client.on("room-full",()=>{
        alert("当前房间人满了");
        isRoomFull = true;
        return
    })
    //a收到b的sdp
    client.on("offer-sdp-msg",async(offerSDP)=>{
        await peer.setRemoteDescription(offerSDP);
        let answerSDP = await peer.createAnswer();
        await peer.setLocalDescription(answerSDP);

        console.log("A收到offerSDP,发送给B answerSDP");
        //a 已经收到offer,需要吧answer发给b
        client.emit("answer-sdp-msg",answerSDP);

    })
    //b收到answer，媒体协商完成
    client.on("answer-sdp-msg",async(answerSDP)=>{
        console.log("B收到answerSDP 媒体协商完成");
        await peer.setRemoteDescription(answerSDP);
    })

    // 交换candiate信息
    client.on('candidate-msg', async (candidate) => {
        console.log("5.* 交换candidate信息");
        await peer.addIceCandidate(candidate)
    })

})

stopBtn.addEventListener("click",()=>{
    console.log("点击了暂停");
    if(peer){
        isStopAudio = !isStopAudio;
        isStopVideo = !isStopVideo;
        peer.getSenders().find(sender => sender.track.kind === 'audio').track.enabled = !isStopAudio;
        peer.getSenders().find(sender => sender.track.kind === 'video').track.enabled = !isStopVideo;

    }
})
videoBtn.addEventListener("click",async()=>{
    let newStream = await getLocalMediaStream({
    video: {
      cursor: 'always' | 'motion' | 'never',
      displaySurface: 'application' | 'browser' | 'monitor' | 'window'
    }
    });
    if (newStream) {
        localStream = newStream;
        setLocalVideoStream(offerVideo, localStream);
        localStream.getVideoTracks().forEach(track => {
        peer.getSenders().find(sender => sender.track.kind === 'video').replaceTrack(track);
        })
    }
})
screenBtn.addEventListener("click",async ()=>{
    let newStream = await getLocalScreenMediaStream({
    video: {
      cursor: 'always' | 'motion' | 'never',
      displaySurface: 'application' | 'browser' | 'monitor' | 'window'
    }
    });
    if (newStream) {
        localStream = newStream;
        setLocalVideoStream(offerVideo, localStream);
        localStream.getVideoTracks().forEach(track => {
        peer.getSenders().find(sender => sender.track.kind === 'video').replaceTrack(track);
        })
    }
})