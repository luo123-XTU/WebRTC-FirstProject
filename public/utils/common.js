
/**
 * 获取本地媒体数据流,异步
 * @param {MediaStreamConstraints} constraints 
 */
export const getLocalMediaStream = async (constraints) => {
  try {
    let stream = await navigator.mediaDevices.getUserMedia(constraints)
    return stream;
  } catch (error) {
    console.log("error", error);
  }
}

/**
 * video
 * @param {HTMLVideoElement} ele 
 * @param {MediaProvider } stream 
 */
export const setLocalVideoStream = async (ele, newStream) => {
  if (ele) {
    let oldstream = ele.srcObject;
    //videoTrack and audioTrack
    if (oldstream) {
      oldstream.getAudioTracks().forEach(e => {
        oldstream.removeTrack(e)
      });
      oldstream.getVideoTracks().forEach(e => {
        oldstream.removeTrack(e)
      });
    }
    //添加新的
    ele.srcObject = newStream
  }
}
/**
 * 
 * @param {HTMLVideoElement} ele 
 * @param {MediaStreamTrack} track 
 */
export const setRemoteVideoStream = async(ele,track) =>{
    if(ele){
        let stream = ele.srcObject;
        if(stream){
            stream.addTrack(track);
        }else{
            let newstream = new MediaStream();
            newstream.addTrack(track);
            ele.srcObject = newstream;
            
        }
    }
}

export const createPeerConnection = () =>{
    const peer = new RTCPeerConnection({
        // bundlePolicy:"max-bundle",
        // rtcpMuxPolicy:"require",
        // iceTransportPolicy:"relay",//强制转发
        // iceServers:[
            
        // ]
    })
    return peer
}

export const createVideoEle = (count) =>{
    let video_container= document.querySelector(".video-container");
    /**
     * @type {HTMLVideoElement}
     */
    let video = document.querySelector("#video"+count);
    if(!video){
        video = document.createElement("video");
        video.muted = true;
        video.autoplay  = true;
        video.controls = true;
        video.id = "video"+count;
        video_container.appendChild(video);
    }
    return video
}