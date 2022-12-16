import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Stack, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React,{useState,useEffect} from 'react'
import { getSender } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider';
import ChatLoading from './ChatLoading';
import GroupChatModal from './miscellaneous/GroupChatModal';
const MyChats = ({fetchAgain}) => {
  const [loggedUser,setLoggedUser]=useState("");
  const {user,setSelectedChat,selectedChat,chats,setChats} = ChatState();
  const toast = useToast();
  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!", 
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      console.log("mychats" + error.message);
    }
  };
  useEffect(() => {
      setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
      fetchChats();
  }, [fetchAgain])
  return (
    <Box
    d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
    flexDir="column"
    alignItems="center"
    p={3}
    bg="white"
    w={{ base: "100%", md: "31%" }}
    borderRadius="lg"
    borderWidth="1px"
    >
      <Box
       pb={3}
       px={3}
       fontSize={{ base: "28px", md: "30px" }}
       fontFamily="Work sans"
       display="flex"
       w="100%"
       justifyContent="space-between"
       alignItems="center"
      >
      
        My chats
        <GroupChatModal>
        <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
          </GroupChatModal>
      </Box>
      <Box
      
      >
        {chats?(
          <Stack overflow='scroll'>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
               
              </Box>
            ))}
          </Stack>
        ):(
          <ChatLoading/>
        )}
        </Box>
    </Box>
  )
}

export default MyChats
