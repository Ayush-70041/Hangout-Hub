import React, { useEffect, useState } from 'react';
import { user } from "../Join/Join"; // Ensure user is defined properly
import socketIo from "socket.io-client";
import "./Chat.css";
import sendLogo from "../../images/send.png";
import Message from "../Message/Message";
import ReactScrollToBottom from "react-scroll-to-bottom";

const ENDPOINT = "https://hangout-hub-1.onrender.com";
let socket;

const Chat = () => {
  const [id, setId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const send = () => {
    if (input.trim()) {
      socket.emit('message', { message: input, id });
      setInput(""); // Clear input
    }
  };

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ['websocket'] });

    socket.on("connect", () => {
      alert("Connected to server");
      setId(socket.id);
    });

    socket.emit('joined', { user });

    socket.on('welcome', (data) => setMessages(prev => [...prev, data]));
    socket.on('userJoined', (data) => setMessages(prev => [...prev, data]));
    socket.on('leave', (data) => setMessages(prev => [...prev, data]));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on('sendMessage', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off('sendMessage');
    };
  }, []);

  return (
    <div className="chatPage">
      <div className="chatContainer">
        <div className="header">
          <h2>Hangout Hub</h2>
          <button onClick={() => window.location.href = '/'} className="closeBtn">
            <i className="fas fa-times"></i> {/* Font Awesome cross icon */}
          </button>
        </div>
        <ReactScrollToBottom className='chatBox'>
          {messages.map((item, i) => (
            <Message key={i} user={item.id === id ? '' : item.user} message={item.message} classs={item.id === id ? 'right' : 'left'} />
          ))}
        </ReactScrollToBottom>
        <div className='inputBox'>
          <input 
            onKeyPress={(event) => { if (event.key === 'Enter') send(); }} 
            type="text" 
            id='chatInput' 
            value={input}
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type a message..."
          />
          <button onClick={send} className='sendBtn'>
            <img src={sendLogo} alt='Send' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
