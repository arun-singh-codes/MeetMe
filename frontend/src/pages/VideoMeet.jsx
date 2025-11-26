import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// export default function VideoMeet() {
//   var socketRef = useRef();   // current socket.io connection  // jab tum io.connect(server_url) karte ho, ye connection socketRef.current me store hota hai.
//   let socketIdRef = useRef();            // current user's socket ID - iska kaam Apne aap ko identify karna (to ignore signals from self)
//   let localVideoRef = useRef();                 // current user's video element reference(  <video> )
//   const videoRef = useRef([]);

//   let [videoAvailable, setVideoAvailable] = useState(false);
//   let [audioAvailable, setAudioAvailable] = useState(false);
//   let [video, setVideo] = useState(true);
//   let [audio, setAudio] = useState(true);
//   let [screen, setScreen] = useState(false);
//   let [showModal, setModal] = useState(true);
//   let [screenAvailable, setScreenAvailable] = useState(false);
//   let [message, setMessage] = useState("");
//   let [messages, setMessages] = useState([]);
//   let [newMessages, setNewMessages] = useState(3);
//   let [askForUsername, setAskForUsername] = useState(true);
//   let [username, setUsername] = useState("");
//   let [videos, setVideos] = useState([])                        // connected users ke video streams list

// useEffect(()=>{                     // setted for ask only on mount
//     console.log("Hello");
//     getPermissions();
// } , [])

// const getPermissions = async()=>{                                                   // Ye user se camera + mic access maangta hai.
//     try{
//         const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
//         if(videoPermission){
//             setVideoAvailable(true);
//             console.log("Video permission granted");
//         }else{
//             setVideoAvailable(false);
//             console.log("Video permission denied");
//         }

//         const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});

//          if(audioPermission){
//             setAudioAvailable(true);
//             console.log("Audio permission granted");
//         }else{
//             setAudioAvailable(false);
//             console.log("Audio permission denied");
//         }

//          if (navigator.mediaDevices.getDisplayMedia) {
//                 setScreenAvailable(true);
//             } else {
//                 setScreenAvailable(false);
//             }
//             if (videoAvailable || audioAvailable) {             // Agar mil jaata hai, to stream set karta hai aur local video preview dikhata hai.
//                 const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
//                 if (userMediaStream) {
//                     window.localStream = userMediaStream;
//                     if (localVideoRef.current) {
//                         localVideoRef.current.srcObject = userMediaStream;
//                     }
//                 }
//             }
//     }catch(err){
//           console.log(err);
//     }
// }

//     useEffect(() => {                           // Jab video ya audio state change hoti hai, to ye effect chalata hai. Jab video/audio toggle hota hai, tab stream dobara fetch hoti hai.
//         if (video !== undefined && audio !== undefined) {
//             getUserMedia();
//             console.log("SET STATE HAS ", video, audio);

//         }
//     }, [video, audio])

//     let getMedia = () => {
//         setVideo(videoAvailable);
//         setAudio(audioAvailable);
//         connectToSocketServer();                            //Video/audio ko enable karke socket.io connection start karta hai.

//     }

//      let getUserMedia = () => {
//         if ((video && videoAvailable) || (audio && audioAvailable)) {
//             navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
//                 .then(getUserMediaSuccess)
//                 .then((stream) => { })
//                 .catch((e) => console.log(e))
//         } else {
//             try {                                                               //  Agar video/audio available nahi hai, ya user ne disable kar diya:
//                 let tracks = localVideoRef.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { }
//         }
//     }

//     let getUserMediaSuccess = (stream) => {             //Yahi wo jagah hai jahan tumhara camera/mic stream milta hai aur fir wo baaki users tak bheja jaata hai
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())        //Agar pehle koi local stream (camera/mic) chal rahi thi, to use stop karta hai.
//         } catch (e) { console.log(e) }

//         window.localStream = stream                 //window.localStream me store kiya gaya (global access ke liye).
//         localVideoRef.current.srcObject = stream    // localVideoRef.current.srcObject me assign kar diya → taaki apna video screen pe dikhe (local preview)

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue      //Apne aap ko stream nahi bhejta

//             connections[id].addStream(window.localStream)               // Matlab: “Mere camera ka stream in sabko dikhao.”

//             connections[id].createOffer().then((description) => {           //Har connection ke liye ek offer SDP banate hain.
//                 console.log(description)                //  // SDP = Session Description Protocol (ye describe karta hai: audio/video codec, resolution, transport info, etc.)
//                 //  Offer ye bolta hai: “Hey peer, ye meri stream info hai, tu accept karega?”
//                 connections[id].setLocalDescription(description)
//                     .then(() => {                                       //  Offer create hoti hai aur socket ke zariye dusre peer ko bheji jaati hai.
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         // Matlab: Jab user camera OFF kar de
//          stream.getTracks().forEach(track => track.onended = () => {                            // Jab bhi video ya audio track band ho jaye, ye function chalega.
//             setVideo(false);
//             setAudio(false);

//             try {
//                 let tracks = localVideoRef.current.srcObject.getTracks()    //localVideoRef.current.srcObject → ye <video> element ka current media stream hai.
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }
//             //Ab WebRTC ko new (blank) stream deni padti hai taaki WebRTC connection na toot jaye.
//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])    //Ye dummy stream create kar raha hai: ek black video track aur ek silent audio track.
//             window.localStream = blackSilence()
//             localVideoRef.current.srcObject = window.localStream                // video element me ab dummy stream show hoga.

//             for (let id in connections) {
//                 connections[id].addStream(window.localStream)

//                 connections[id].createOffer().then((description) => {  // WebRTC me jab stream change hota hai, hume offer create karna padta hai.  // Jab original stream end ho jaye, to saare connections me ek valid (lekin empty) stream bhejna, taaki WebRTC connection break na ho.
//                     connections[id].setLocalDescription(description)
//                         .then(() => {
//                             socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription })) //  Ye signal server ke through peer ko bhej raha hai ki stream change ho gaya hai.
//                         })
//                         .catch(e => console.log(e))
//                 })
//             }
//         })
//     }

//     let getDisplayMedia = ()=>{
//         if(screen){
//             if(navigator.mediaDevices.getDisplayMedia){
//                 navigator.mediaDevices.getDisplayMedia({video:true , audio:true})
//                 .then(getDisplayMediaSuccess(stream))
//                 .then(stream => {})
//                 .catch(err => {console.log("Error getting display media: ", err)});
//             }
//         }
//     }

//     let getDisplayMediaSuccess = (stream) => {                           // Ye function call hota hai jab navigator.mediaDevices.getDisplayMedia() successfully screen capture stream return karta hai.
//         console.log("HERE")
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())       // Agar pehle koi local stream (camera/mic/screen) chal rahi thi, to use stop karta hai./
//         } catch (e) { console.log(e) }

//         window.localStream = stream                                                 // window.localStream → globally store kar raha hai naya stream (screen capture).
//         localVideoRef.current.srcObject = stream                                    //  localVideoref.current.srcObject → <video> element me show kar raha hai naya stream.

//         for (let id in connections) {                                           // Peer Connections Update kar raha hai taaki sabko naya stream mil jaye.
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//          stream.getTracks().forEach(track => track.onended = () => {                        //Jab screen share band kara jaye (track.onended) → ye event fire hota hai.
//             setScreen(false)

//             try {
//                 let tracks = localVideoRef.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())       // Agar pehle koi local stream (camera/mic/screen) chal rahi thi, to use stop karta hai./
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoRef.current.srcObject = window.localStream

//             getUserMedia()     // Screen share band hone ke baad user ko wapas apna camera/mic stream chahiye hota hai.Isliye getUserMedia() dubara call hota hai.

//         })
//     }

//      let gotMessageFromServer = (fromId, message) => {                          //  Ye function call hota hai jab server se koi signal/message aata hai (socket message)
//         var signal = JSON.parse(message)        //Server se message JSON string me aata hai, isse object me convert karte hain.
//         // fromId = wo socket ID jisse message (signal) aaya hai

//         // connections[fromId]--> Us peer (fromId) ke liye stored RTCPeerConnection object
//         if (fromId !== socketIdRef.current) {   // Agar message apne aap se aaya hai, ignore karo Sirf dusre peers ke messages process karo.
//             if (signal.sdp) {                     // signal me do cheeze ho sakti hain:   signal.sdp → Session Description (offer/answer)    //signal.ice → ICE candidate (peer connection path info)
//                 connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {//setRemoteDescription(signal.sdp) Ye peer connection ko batata hai ki remote peer kya stream share kar raha hai / kya offer bheja hai
//                      //  "Main A ke offer ko accept kar raha hoon aur uske hisaab se connection setup kar raha hoon."
//                     if (signal.sdp.type === 'offer') {               // Agar received SDP ek offer hai, to ek answer create karo.
//                         connections[fromId].createAnswer().then((description) => {
//                             connections[fromId].setLocalDescription(description).then(() => {     // setLocalDescription--> "Ye mera offer hai, mai ise officially use karne wala hoon."
//                                 socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))       // server ke through remote peer ko answer bhejo
//                             }).catch(e => console.log(e))
//                         }).catch(e => console.log(e))
//                     }
//                 }).catch(e => console.log(e))
//             }

//             if (signal.ice) {  //agr  Remote peer ne ICE candidate bheja , → isse apne peer connection me add kar do , → taaki direct peer-to-peer path ban sake.w
//                 connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
//             }
//         }
//     }

//     let connectToSocketServer = () => {                //  Ye function socket server se connect karta hai aur peers ke liye WebRTC setup initialize karta hai.
//         socketRef.current = io.connect(server_url, { secure: false })   //  io.connect → socket.io client ko server se connect karta hai  secure: false → HTTPS nahi, simple HTTP connection

//         socketRef.current.on('signal', gotMessageFromServer)    //  Jab bhi server se WebRTC signaling message aata hai, gotMessageFromServer function call hota hai
//                                                                 //  Signaling messages me SDP offer/answer aur ICE candidates hote hain

//         socketRef.current.on('connect', () => {         //  Jab socket successfully connect ho jata hai:
//             socketRef.current.emit('join-call', window.location.href)           //  Server ko join-call event bhejte hain (room = current URL)
//             socketIdRef.current = socketRef.current.id                  // socketIdRef.current → apna unique socket ID store karte hain

//             socketRef.current.on('chat-message', addMessage)                //.on se recieve karte hain. Server pe  Chat messages handle karna (addMessage)

//             socketRef.current.on('user-left', (id) => {                     //  Jab koi user call chhod deta hai: remove video from UI
//                 setVideos((videos) => videos.filter((video) => video.socketId !== id))
//             })

//             socketRef.current.on('user-joined', (id, clients) => {          //  clients → array of current room ke socket IDs.
//                 clients.forEach((socketListId) => {

//                     connections[socketListId] = new RTCPeerConnection(peerConfigConnections)  // // Create Peer Connections : Har client ke liye RTCPeerConnection object create hota hai  peerConfigConnections → STUN/TURN server config
//                     // Wait for their ice candidate
//                     connections[socketListId].onicecandidate = function (event) {       // Browser ICE candidate generate karta hai → server ke through peer ko bheja jata hai
//                         if (event.candidate != null) {                  // Ye peer-to-peer path establish karne ke liye zaruri hai
//                             socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
//                         }
//                     }
//                     // Wait for their video stream
//                     connections[socketListId].onaddstream = (event) => {                // Jab peer stream bhejta hai → ye function call hota hai
//                         console.log("BEFORE:", videoRef.current);
//                         console.log("FINDING ID: ", socketListId);

//                         let videoExists = videoRef.current.find(video => video.socketId === socketListId);     // search karo array me ki koi object hai  videoRef.current isme jsika id socketListId ke barabar ho
//                                                                                                                                                 //  videoRef.current ka structure kuch is tarah ka hota hai:
//                                                                                                             //kya ye peer already humare ui videos me hai?
//                                                                                                                                      //       videoRef.current = [
//                                                                                                                                                     // { socketId: 'abc123', stream: MediaStream, autoplay: true },
//                                                                                                                                                     // { socketId: 'def456', stream: MediaStream, autoplay: true }
//                                                                                                                                                 // ]

//                         if (videoExists) {                     // Agar video already exist karta hai → stream update kar do
//                             console.log("FOUND EXISTING");

//                             // Update the stream of the existing video
//                             setVideos(videos => {               // videos --> React state array, jisme connected peers ke video objects hote hain:
//                                 const updatedVideos = videos.map(video =>
//                                     video.socketId === socketListId ? { ...video, stream: event.stream } : video
//                                 );
//                                 videoRef.current = updatedVideos;         //  updatedVideos = naya array, jisme sirf matching peer ka stream update hua, baaki objects same rahe.
//                                 return updatedVideos;
//                             });
//                         } else {                                // Agar video exist nahi karta → naya video object create karo
//                             // Create a new video
//                             console.log("CREATING NEW");
//                             let newVideo = {
//                                 socketId: socketListId,
//                                 stream: event.stream,
//                                 autoplay: true,
//                                 playsinline: true
//                             };

//                             setVideos(videos => {
//                                 const updatedVideos = [...videos, newVideo];
//                                 videoRef.current = updatedVideos;
//                                 return updatedVideos;
//                             });
//                         }
//                     };

//                     // Add the local video stream
//                     if (window.localStream !== undefined && window.localStream !== null) {
//                         connections[socketListId].addStream(window.localStream)
//                     } else {
//                         let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//                         window.localStream = blackSilence()
//                         connections[socketListId].addStream(window.localStream)
//                     }
//                 })

//                 if (id === socketIdRef.current) {                 // “Agar maine khud room join kiya hai, to main baaki sab peers ko offer bhejunga.”
//                     for (let id2 in connections) {
//                         if (id2 === socketIdRef.current) continue       // (apne aap se connection nahi banate)

//                         try {
//                             connections[id2].addStream(window.localStream)  //  New user → apna camera/mic ka stream har peer ke connection me add karta hai.
//                         } catch (e) { }

//                         connections[id2].createOffer().then((description) => {              // jab koi nya user join hota hai to wo sabko offer bhejta hai ye rule hai webrtc me
//                             connections[id2].setLocalDescription(description)
//                                 .then(() => {
//                                     socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
//                                 })
//                                 .catch(e => console.log(e))
//                         })
//                     }
//                 }
//             })

//         })
//     }

//     let silence = () => {
//         let ctx = new AudioContext()
//         let oscillator = ctx.createOscillator()
//         let dst = oscillator.connect(ctx.createMediaStreamDestination())
//         oscillator.start()
//         ctx.resume()
//         return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
//     }
//     let black = ({ width = 640, height = 480 } = {}) => {
//         let canvas = Object.assign(document.createElement("canvas"), { width, height })
//         canvas.getContext('2d').fillRect(0, 0, width, height)
//         let stream = canvas.captureStream()
//         return Object.assign(stream.getVideoTracks()[0], { enabled: false })
//     }

//     let handleVideo = () => {
//         setVideo(!video);
//         // getUserMedia();
//     }
//     let handleAudio = () => {
//         setAudio(!audio)
//         // getUserMedia();
//     }

//     useEffect(() => {
//         if (screen !== undefined) {
//             getDisplayMedia();
//         }
//     }, [screen])

//     let handleScreen = () => {
//         setScreen(!screen);
//     }

//     let handleEndCall = () => {
//         try {
//             let tracks = localVideoRef.current.srcObject.getTracks()
//             tracks.forEach(track => track.stop())
//         } catch (e) { }
//         window.location.href = "/"
//     }

//     // let openChat = () => {
//     //     setModal(true);
//     //     setNewMessages(0);
//     // }
//     // let closeChat = () => {
//     //     setModal(false);
//     // }
//     // let handleMessage = (e) => {
//     //     setMessage(e.target.value);
//     // }

//     // messages = [
//             //      { sender: "Arun", data: "Hello" },
//             //       { sender: "Me", data: "Hi!" }
//                //        ];

//     const addMessage = (data, sender, socketIdSender) => {
//         setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: sender, data: data }
//         ]);
//         if (socketIdSender !== socketIdRef.current) {
//             setNewMessages((prevNewMessages) => prevNewMessages + 1);
//         }
//     };

//      let sendMessage = () => {
//         console.log(socketRef.current);
//         socketRef.current.emit('chat-message', message, username)
//         setMessage("");

//         // this.setState({ message: "", sender: username })
//     }

//     let connect = () => {
//         setAskForUsername(false);
//         getMedia();
//     }

//      return (
//         <div>

//             {askForUsername === true ?

//                 <div>

//                     <h2>Enter into Lobby </h2>
//                     <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
//                     <Button variant="contained" onClick={connect}>Connect</Button>

//                     <div>
//                         <video ref={localVideoRef} autoPlay muted></video>
//                     </div>

//                 </div> :

//                 <div className={styles.meetVideoContainer}>

//                     {showModal ? <div className={styles.chatRoom}>

//                         <div className={styles.chatContainer}>
//                             <h1>Chat</h1>

//                             <div className={styles.chattingDisplay}>

//                                 {messages.length !== 0 ? messages.map((item, index) => {

//                                     console.log(messages)
//                                     return (
//                                         <div style={{ marginBottom: "20px" }} key={index}>
//                                             <p style={{ fontWeight: "bold" }}>{item.sender}</p>
//                                             <p>{item.data}</p>
//                                         </div>
//                                     )
//                                 }) : <p>No Messages Yet</p>}

//                             </div>

//                             <div className={styles.chattingArea}>
//                                 <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
//                                 <Button variant='contained' onClick={sendMessage}>Send</Button>
//                             </div>

//                         </div>
//                     </div> : <></>}

//                     <div className={styles.buttonContainers}>
//                         <IconButton onClick={handleVideo} style={{ color: "white" }}>
//                             {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
//                         </IconButton>
//                         <IconButton onClick={handleEndCall} style={{ color: "red" }}>
//                             <CallEndIcon  />
//                         </IconButton>
//                         <IconButton onClick={handleAudio} style={{ color: "white" }}>
//                             {audio === true ? <MicIcon /> : <MicOffIcon />}
//                         </IconButton>

//                         {screenAvailable === true ?
//                             <IconButton onClick={handleScreen} style={{ color: "white" }}>
//                                 {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
//                             </IconButton> : <></>}

//                         <Badge badgeContent={newMessages} max={999} color='orange'>
//                             <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
//                                 <ChatIcon />                        </IconButton>
//                         </Badge>

//                     </div>

//                     <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>

//                     <div className={styles.conferenceView}>
//                         {videos.map((video) => (
//                             <div key={video.socketId}>
//                                 <video

//                                     data-socket={video.socketId}
//                                     ref={ref => {
//                                         if (ref && video.stream) {
//                                             ref.srcObject = video.stream;
//                                         }
//                                     }}
//                                     autoPlay
//                                 >
//                                 </video>
//                             </div>

//                         ))}

//                     </div>

//                 </div>

//             }

//         </div>
//     )
// }

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoref = useRef();
  let newlyJoinedRef = useRef(true);

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState([]);

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(3);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  // TODO
  // if(isChrome() === false) {

  // }

  useEffect(() => {
    console.log("HELLO");
    getPermissions();
  });

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
      console.log("SET STATE HAS ", video, audio);
    }
  }, [video, audio]);
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  let getDislayMediaSuccess = (stream) => {
    console.log("HERE");
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message); //JSON.parse → JSON string → JS object          JSON.stringify → JS object → JSON string

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            // remote stream received here
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };
              newlyJoinedRef.current = newVideo.stream;

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = () => {
    setVideo(!video);
    // getUserMedia();
  };
  let handleAudio = () => {
    setAudio(!audio);
    // getUserMedia();
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  // let openChat = () => {
  //     setModal(true);
  //     setNewMessages(0);
  // }
  // let closeChat = () => {
  //     setModal(false);
  // }
  // let handleMessage = (e) => {
  //     setMessage(e.target.value);
  // }

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  let sendMessage = () => {
    console.log(socketRef.current);
    socketRef.current.emit("chat-message", message, username);
    setMessage("");

    // this.setState({ message: "", sender: username })
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby </h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoref} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      console.log(messages);
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.othersVideosList}>
              {/* <div className={styles.conferenceView}> */}
              <div className={styles.othersVideos}>
                {videos.map((video) => (
                  <div key={video.socketId}>
                    <video
                      data-socket={video.socketId}
                      ref={(ref) => {
                        if (ref && video.stream) {
                          ref.srcObject = video.stream;
                        }
                      }}
                      autoPlay
                    ></video>
                  </div>
                ))}
              </div>
              <div className={styles.myVideo}>
                <video
                  className={
                    videos.length === 0
                      ? styles.meetUserVideoLarge
                      : styles.meetUserVideoSmall
                  }
                  ref={localVideoref}
                  autoPlay
                  muted
                ></video>
              </div>
              {/* </div> */}
            </div>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="orange">
              <IconButton
                onClick={() => setModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />{" "}
              </IconButton>
            </Badge>
          </div>

          
            <div className={styles.videoArea}>
              {videos.length === 0 ? (
                <video
                  className={styles.meetUserVideoLarge}
                  ref={localVideoref}
                  autoPlay
                  muted
                ></video>
              ) : (
                <video ref={newlyJoinedRef}></video>
              )}
            </div>
          
        </div>
      )}
    </div>
  );
}
