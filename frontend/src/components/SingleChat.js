import React,{useState,useEffect} from 'react'
import { Box, Text } from "@chakra-ui/layout";
import { FormControl, IconButton, Input, Spinner, useToast } from "@chakra-ui/react";
import { ChatState } from '../Context/ChatProvider';
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender,getSenderFull } from '../config/ChatLogics';
import ProfileModel from './miscellaneous/ProfileModel';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css';
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client"
import Lottie from 'react-lottie'
import animationData from "../animations/typing.json";
// const ENDPOINT="http://localhost:5000";
const ENDPOINT="https://mern-chat-app-api.onrender.com";
var socket,selectedChatCompare;
const SingleChat = ({fetchAgain,setFetchAgain}) => {
    const {user,selectedChat,setSelectedChat,notification,setNotification} =ChatState();
    const [messages,setMessages] = useState([]);
    const [loading,setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected,setSocketConnected] = useState(false);
    const [typing,setTyping] =useState(false);
    const [istyping,setIsTyping] =useState(false);
    const toast = useToast();
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
        
      },
    };
    const fetchMessages=async()=>{
      if(!selectedChat){
        return;
      }
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        setLoading(true);
        const {data} = await axios.get(`/api/message/${selectedChat._id}`,config);
        setMessages(data);
        setLoading(false);
        socket.emit('join chat',selectedChat._id);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
    const sendMessage=async(event)=>{
        if(event.key==="Enter" && newMessage){
          socket.emit('stop typing',selectedChat._id);
            try {
              const config = {
                headers: {
                  "Content-type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
              };
              setNewMessage(""); //will not affect the following request
              //it is done to instantly clear input 
              const {data} = await axios.post('/api/message',{
                content:newMessage,
                chatId:selectedChat._id,
              },config);
             
              socket.emit('new message',data);
              setMessages([...messages,data]);
               
            } catch (error) {
              toast({
                title: "Error Occured!",
                description: "Failed to send the Message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
            }
        }
    }
    const typingHandler=(e)=>{
        setNewMessage(e.target.value);

        //typing indicator logic
        if(!socketConnected) return;
        if(!typing){
          setTyping(true);
          socket.emit('typing',selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength=3000; //3 sec
        setTimeout(()=>{
          var timeNow = new Date().getTime();
          var timeDiff = timeNow - lastTypingTime;
          if(timeDiff>=timerLength && typing){
            socket.emit('stop typing',selectedChat._id);
            setTyping(false);

          }
        },timerLength);
    } 
    useEffect(()=>{
      socket = io(ENDPOINT);
      socket.emit("setup",user);
      socket.on('connected',()=>setSocketConnected(true));
      socket.on('typing',()=>setIsTyping(true))
      socket.on('stop typing',()=>setIsTyping(false))
    },[]);
    useEffect(() => {
        fetchMessages();
        selectedChatCompare=selectedChat;
    }, [selectedChat]);
   
    useEffect(()=>{
      socket.on("message recieved",(newMessageRecived)=>{
        if(!selectedChatCompare || selectedChatCompare._id !==newMessageRecived.chat._id){
          //give notification 
          //conditions - > whe no chat is selected or when the chat is selected
          //does not match the currently selected chat
          if(!notification.includes(newMessageRecived)){
            setNotification([newMessageRecived,...notification]);
            setFetchAgain(!fetchAgain);
          }
        }else{
          setMessages([...messages,newMessageRecived]);
        }
      })
    })
    return (
    <>
    {selectedChat?(
    <>
    <Text  fontSize={{ base: "28px", md: "30px" }}
    pb={3}
    px={2}
    w="100%"
    fontFamily="Work sans"
    display="flex"
    justifyContent={{ base: "space-between" }}
    alignItems="center">
        <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
        {!selectedChat.isGroupChat ?(<>
        {getSender(user,selectedChat.users)}
        <ProfileModel user={getSenderFull(user,selectedChat.users)}/>
        </>
        ):(
        <>{selectedChat.chatName.toUpperCase()}
        <UpdateGroupChatModal
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
        fetchMessages={fetchMessages}
        />
        </>
        )}

    </Text>
    <Box  display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden">
       {loading?(
          <Spinner size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"/>
       ):(
        <div className='messages'>
          <ScrollableChat messages={messages} />
        </div>
       )}
<FormControl  onKeyDown={sendMessage} isRequiredmt={3}>
  {istyping?<div>
    <Lottie
    options={defaultOptions}
    width={70}
    style={{marginBottom:15,marginLeft:0}}
    />
  </div>:<></>}
    <Input
    variant="filled"
    bg="#E0E0E0"
    placeholder="Enter a message.."
    value={newMessage}
    onChange={typingHandler}
  />

</FormControl>
    </Box>
    </>
    ):( <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>)}
    </>
  )
}

export default SingleChat
