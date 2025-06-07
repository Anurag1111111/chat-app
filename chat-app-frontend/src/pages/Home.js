import React, { useEffect, useState } from 'react';
import API from '../utils/api.js';
import { getUser, logout } from '../utils/auth.js';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Chat from "../components/Chat.js";

const socket = io('https://chat-app-50pr.onrender.com');

const Home = () => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [theme, setTheme] = useState("light"); 

    const navigate = useNavigate();

    useEffect(() => {
        if (theme === "dark") {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [theme]);

    useEffect(() => {
        const storedUser = getUser();
        if (!storedUser) return navigate("/login");
        setUser(storedUser);
    }, [navigate]);

    useEffect(() => {
        if (!user) return;

        const fetchUsers = async () => {
            try {
                const { data } = await API.get("/users");
                setUsers(data.filter((u) => u._id !== user._id));
            } catch (err) {
                console.log(err);
            }
        };

        fetchUsers();
        socket.emit('join', user._id);
    }, [user]);

    const handleLogout = () => {
        logout();
        document.body.classList.remove("dark-mode");
        navigate("/login");
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    return (
        <div className={`home-container theme-${theme}`}>
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="user-info">
                        <div className="avatar">{user?.username.charAt(0).toUpperCase()}</div>
                        <h3>{user?.username}</h3>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>

                <h4 className="section-title">Chat With</h4>
                <div className="user-list">
                    {users.map((u) => (
                        <div
                            key={u._id}
                            onClick={() => setSelectedUser(u)}
                            className={`user-item ${selectedUser?._id === u._id ? 'selected' : ''}`}
                        >
                            <div className="avatar">{u.username.charAt(0).toUpperCase()}</div>
                            <span>{u.username}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-container">
                <div className="theme-toggle-container">
                    <button onClick={toggleTheme} className="theme-toggle-btn">
                        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                    </button>
                </div>
                {selectedUser ? (
                    <Chat
                        socket={socket}
                        currentUser={user}
                        selectedUser={selectedUser}
                        theme={theme}
                    />
                ) : (
                    <p>Select a user to start chatting</p>
                )}
            </div>
        </div>
    );
};

export default Home;
