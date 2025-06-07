import React, { useEffect, useState, useRef } from "react";
import API from "../utils/api";

const Chat = ({ socket, currentUser, selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);

    let typingTimeout;

    const handleTyping = () => {
        socket.emit('typing', {
            senderId: currentUser._id,
            receiverId: selectedUser._id,
        });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stop_typing', {
                senderId: currentUser._id,
                receiverId: selectedUser._id,
            });
        }, 3000);
    };

    useEffect(() => {
        socket.on("typing", ({ senderId }) => {
            if (senderId === selectedUser._id) {
                setIsTyping(true);
            }
        });

        socket.on("stop_typing", ({ senderId }) => {
            if (senderId === selectedUser._id) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.off("typing");
            socket.off("stop_typing");
        };
    }, [socket, selectedUser._id]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await API.get(`/messages/${selectedUser._id}`);
                setMessages(data);
            } catch (err) {
                console.error(err)
            }
        }
        fetchMessages();
    }, [selectedUser]);

    useEffect(() => {
        socket.on('receive_message', (message) => {
            if (
                (message.sender === selectedUser._id && message.receiver === currentUser._id) ||
                (message.sender === currentUser._id && message.receiver === selectedUser._id)
            ) {
                setMessages((prev) => [...prev, message]);
            }
        });
        return () => socket.off("receive_message");
    }, [socket, currentUser._id, selectedUser._id]);

    const sendMessage = () => {
        if (!text.trim()) return;

        const messageData = {
            senderId: currentUser._id,
            receiverId: selectedUser._id,
            text,
            timestamp: new Date().toISOString(),
        }
        console.log("Sending message:", messageData);

        socket.emit('send_message', messageData);
        setMessages((prev) => [...prev, { ...messageData, sender: currentUser._id }]);
        setText("");
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <div className="chat-area">
            <h3>Chat with {selectedUser.username}</h3>
            <div className="message-box">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`message ${msg.sender === currentUser._id ? 'sent' : 'received'}`}
                    >
                        <div>{msg.text}</div>
                        <div className="timestamp">
                            {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime())
                                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Sending...'}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className={`typing-start ${isTyping ? 'show' : 'hide'}`}>
                        <span className="typing-dot">💬</span>
                        <span>{selectedUser.username} is typing...</span>
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            <div className="chat-input">
                <input
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        handleTyping();
                    }}
                    placeholder="Type message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    )
}

export default Chat;