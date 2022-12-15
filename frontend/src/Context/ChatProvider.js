import {createContext,useContext,useState,useEffect} from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();
const ChatProvider = ({children})=>{
    const [user,setUser] = useState();
    const [selectedChat,setSelectedChat] = useState();
    const [chats,setChats] = useState([]);
    const [notification,setNotification] = useState([]);
    let history = useHistory();
    useEffect(()=>{
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);
        //if user is not logged in 
        if(!userInfo){
            history.push("/");
        }
    },[history]);
    return(
        <ChatContext.Provider value={{notification,setNotification,user,setUser,selectedChat,setSelectedChat,chats,setChats}}>
            {children} 
        </ChatContext.Provider>
    )
};
export const ChatState=()=>{
    return useContext(ChatContext);
}

export default ChatProvider;