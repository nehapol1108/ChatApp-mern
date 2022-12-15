import React from 'react'
import { useState } from 'react';
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { useToast } from "@chakra-ui/toast";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";
import {useHistory} from "react-router-dom"
const Login = () => {
    const [email,setEmail] = useState();
    const [password,setPassword] = useState(); 
    const [show,setshow] = useState(false);
    const [loading,setLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();
    const handleClick =()=> {setshow(!show)};

    const submitHandler= async()=>{
        setLoading(true);
        if(!email || !password){
            toast({
                title: 'Please Select an Image',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
        try{
            const config = {
                headers:{
                    "Content-type":"application/json",
                },
            };
            const {data} = await axios.post(
            "/api/user/login",
            {email,password},
            config
            );
            toast({
                title: 'Login Successfull',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            localStorage.setItem('userInfo',JSON.stringify(data));
            setLoading(false);
            history.push("/chats");

        }catch(err){
            toast({
                title: 'Error occured',
                status: 'warning',
                description:err.response.data.message,
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }

    }
  return (
    <VStack spacing='5px'>

        <FormControl id='emaill' isRequired>
            <FormLabel>Email</FormLabel>
            <Input
            placeholder='Enter Your Email'
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />
        </FormControl>

        <FormControl id='passwordd' isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
            <Input
            type={show?"text" : "password"}
            placeholder='Enter Your Password'
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show?"Hide":"Show"}
                </Button>
            </InputRightElement>
            </InputGroup>
        </FormControl>

        <Button
        colorScheme="blue"
        width="100%"
        style={{marginTop:15}}
        onClick={submitHandler}
        isLoading={loading}
        >
           Login
        </Button>
        <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        onClick={()=>{
            setEmail("guest@example.com");
            setPassword("123456");
        }}
        >
           Get Guest User Credentials
        </Button>
    </VStack>
  )
}

export default Login
