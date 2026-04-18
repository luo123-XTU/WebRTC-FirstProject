import {io} from './utils/socket.io.esm.min.js'

const roomInput = document.querySelector("#roomId")
const userInput = document.querySelector("#userId")
const startBtn = document.querySelector('.startBtn')
const stopBtn = document.querySelector('.stopBtn')
const videoBtn = document.querySelector('.videoBtn');
const screenBtn = document.querySelector('.screenBtn');

let offerVideo = document.querySelector('.offerVideo');

//人数是否满
let isRoomFull = false;
//房间号和用户名
let roomId;
let userId;
//socket对象
let client;
let serverUrl = "wss://172.25.46.144:3000/"

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
})