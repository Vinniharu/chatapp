'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { ref, push, onValue, off, child, get, getDatabase } from 'firebase/database';
import { database } from '../firebase/config';

interface Message {
  id: string;
  sender: string;
  senderEmail: string | null;
  text: string;
  timestamp: number;
}

export default function ChatRoom({ recipient }: { recipient: { uid: string; email: string | null } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket, sendMessage, joinRoom, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a unique room ID for the conversation (sort UIDs to ensure consistency)
  const roomId = [user?.uid, recipient.uid].sort().join('-');

  useEffect(() => {
    if (!user) return;

    // Set up socket.io connection for real-time messaging
    if (isConnected) {
      // Join the chat room
      joinRoom(roomId);

      // Listen for incoming messages
      socket?.on('receive-message', (message: Message) => {
        setMessages((prevMessages) => {
          // Check if message already exists (avoid duplicates)
          const exists = prevMessages.some(m => m.id === message.id);
          if (exists) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
      });
    }

    // Load chat history from Firebase
    const chatRef = ref(database, `chats/${roomId}/messages`);
    setLoading(true);

    // First, try to get all messages at once
    get(chatRef).then((snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList: Message[] = Object.values(messagesData);
        
        // Sort messages by timestamp
        messagesList.sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messagesList);
      }
      setLoading(false);
    }).catch(error => {
      console.error("Error loading chat history:", error);
      setLoading(false);
    });

    // Then, listen for new messages
    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList: Message[] = Object.values(messagesData);
        
        // Sort messages by timestamp
        messagesList.sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messagesList);
      }
    });

    // Cleanup
    return () => {
      socket?.off('receive-message');
      off(chatRef);
    };
  }, [isConnected, user, socket, roomId, joinRoom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: user.uid,
      senderEmail: user.email,
      text: newMessage,
      timestamp: Date.now(),
    };

    // Save message to Firebase
    const chatRef = ref(database, `chats/${roomId}/messages`);
    push(chatRef, message);

    // Send the message through Socket.io for real-time delivery
    sendMessage(roomId, message);
    
    // Clear input field
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="font-medium">
          Chatting with: {recipient.email || 'Anonymous User'}
        </h3>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 max-w-[70%] ${
                message.sender === user?.uid
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } rounded-lg p-3`}
            >
              <div className="text-xs mb-1">
                {message.sender === user?.uid ? 'You' : message.senderEmail || 'Anonymous'}
              </div>
              <div>{message.text}</div>
              <div className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-3 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!isConnected}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
} 