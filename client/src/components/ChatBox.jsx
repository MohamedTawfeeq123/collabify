import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { FiSend, FiUsers } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import API from '../api/axios';
import { formatRelativeTime, getInitials } from '../utils/helpers';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatBox = ({ projectId, projectName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 1. Fetch message history
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/messages/${projectId}`);
        if (res.data.success) {
          setMessages(res.data.data);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    fetchHistory();

    // 2. Initialize Socket Connection
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('setupUser', user?._id);
      socket.emit('joinProject', { projectId, user });
    });

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    // Listen for online count
    socket.on('projectOnlineUsers', (data) => {
      if (data.projectId === projectId) {
        setOnlineCount(data.onlineCount);
      }
    });

    // Listen for typing events
    socket.on('userTyping', (data) => {
      if (data.projectId === projectId && data.username !== user?.username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.fullName || data.username)) {
            return [...prev, data.fullName || data.username];
          }
          return prev;
        });
      }
    });

    socket.on('userStoppedTyping', (data) => {
      if (data.projectId === projectId) {
        setTypingUsers((prev) =>
          prev.filter((u) => u !== (data.fullName || data.username))
        );
      }
    });

    return () => {
      socket.emit('leaveProject', { projectId, userId: user?._id });
      socket.disconnect();
    };
  }, [projectId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (socketRef.current) {
      socketRef.current.emit('typing', {
        projectId,
        username: user?.username,
        fullName: user?.fullName
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stopTyping', {
          projectId,
          username: user?.username
        });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageContent = text.trim();
    setText('');

    if (socketRef.current) {
      socketRef.current.emit('stopTyping', {
        projectId,
        username: user?.username
      });
      socketRef.current.emit('sendMessage', {
        projectId,
        senderId: user?._id,
        text: messageContent
      });
    } else {
      // Fallback HTTP POST
      try {
        const res = await API.post(`/messages/${projectId}`, { text: messageContent });
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.data]);
        }
      } catch (err) {
        console.error('Failed to post message:', err);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-page)'
        }}
      >
        <div>
          <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            #{projectName || 'Project Chat'}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-time team communication
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--success)',
            fontWeight: 600
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--success)',
              display: 'inline-block'
            }}
          />
          <FiUsers />
          <span>{onlineCount} Online</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              margin: 'auto',
              fontSize: '0.9rem'
            }}
          >
            No messages yet. Say hello to your team! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  flexDirection: isMe ? 'row-reverse' : 'row'
                }}
              >
                {!isMe && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {getInitials(msg.sender?.fullName)}
                  </div>
                )}
                <div>
                  {!isMe && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginBottom: '0.2rem'
                      }}
                    >
                      {msg.sender?.fullName || 'Teammate'}
                    </div>
                  )}
                  <div
                    style={{
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isMe ? 'var(--primary)' : 'var(--bg-card-hover)',
                      color: isMe ? 'var(--text-on-primary)' : 'var(--text-primary)',
                      fontSize: '0.9rem',
                      wordBreak: 'break-word',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {msg.text}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem',
                      textAlign: isMe ? 'right' : 'left'
                    }}
                  >
                    {formatRelativeTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {typingUsers.length > 0 && (
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--primary)',
                animation: 'pulse 1s infinite'
              }}
            />
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          maxLength={1000}
          className="form-input"
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!text.trim()}
          style={{ padding: '0.7rem 1.25rem' }}
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
