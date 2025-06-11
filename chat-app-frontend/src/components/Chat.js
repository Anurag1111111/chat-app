import React, { useEffect, useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import API from "../utils/api";

const Chat = ({ socket, currentUser, selectedUser, theme }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const bottomRef = useRef(null);
    const textareaRef = useRef(null);
    const emojiRef = useRef(null);

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

    const handleEmojiClick = (emojiData) => {
        setText(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
    };

    const sendMessage = () => {
        if (!text.trim()) return;

        const messageData = {
            senderId: currentUser._id,
            receiverId: selectedUser._id,
            text,
            createdAt: new Date().toISOString(),
        };

        socket.emit("send_message", messageData);
        setMessages(prev => [...prev, { ...messageData, sender: currentUser._id }]);
        setText("");
        setShowEmojiPicker(false);
    };

    const getMessageDateLabel = (createdAt) => {
        const messageDate = new Date(createdAt);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday = messageDate.toDateString() === today.toDateString();
        const isYesterday = messageDate.toDateString() === yesterday.toDateString();

        if (isToday) return "Today";
        if (isYesterday) return "Yesterday";

        return messageDate.toLocaleDateString("en-US", {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await API.get(`/messages/${selectedUser._id}`);
                setMessages(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [selectedUser]);

    useEffect(() => {
        socket.on("receive_message", (message) => {
            if (
                (message.sender === selectedUser._id && message.receiver === currentUser._id) ||
                (message.sender === currentUser._id && message.receiver === selectedUser._id)
            ) {
                setMessages(prev => [...prev, message]);
            }
        });
        return () => socket.off("receive_message");
    }, [socket, currentUser._id, selectedUser._id]);

    useEffect(() => {
        socket.on("typing", ({ senderId }) => {
            if (senderId === selectedUser._id) setIsTyping(true);
        });

        socket.on("stop_typing", ({ senderId }) => {
            if (senderId === selectedUser._id) setIsTyping(false);
        });

        return () => {
            socket.off("typing");
            socket.off("stop_typing");
        };
    }, [socket, selectedUser._id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <div className="chat-area">
            <h3>Chat with {selectedUser.username}</h3>
            <div className="message-box">
                {messages.map((msg, idx) => {
                    const showDate =
                        idx === 0 ||
                        new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString();

                    return (
                        <React.Fragment key={idx}>
                            {showDate && (
                                <div className="message-date">
                                    {getMessageDateLabel(msg.createdAt)}
                                </div>
                            )}
                            <div className={`message ${msg.sender === currentUser._id ? 'sent' : 'received'}`}>
                                <div>{msg.text}</div>
                                <div className="timestamp">
                                    {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime())
                                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Sending...'}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {isTyping && (
                    <div className={`typing-start ${isTyping ? 'show' : 'hide'}`}>
                        <span className="typing-dot">💬</span>
                        <span>{selectedUser.username} is typing...</span>
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            <div className="chat-input">
                <div className="textarea-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            handleTyping();

                            const textarea = textareaRef.current;
                            if (textarea) {
                                textarea.style.height = "auto";
                                textarea.style.height = `${textarea.scrollHeight}px`;
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Type message..."
                    />

                    <span className="emoji-icon" onClick={() => setShowEmojiPicker(prev => !prev)}
                        aria-label="Toggle emoji picker" role="button" tabIndex={0}>
                        😊
                    </span>

                    {showEmojiPicker && (
                        <div className="emoji-picker-inside" ref={emojiRef}>
                            <EmojiPicker onEmojiClick={handleEmojiClick} theme={theme === "dark" ? "dark" : "light"} />
                        </div>
                    )}
                </div>
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    )
}

export default Chat;