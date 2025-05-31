'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState('');
  const [targetName, setTargetName] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [myId, setMyId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('https://mongorailwaytry-production.up.railway.app/verify-token', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then(() => {
        setAuthorized(true);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const newSocket = io('https://mongorailwaytry-production.up.railway.app');

    newSocket.on('connect', () => {
      if (newSocket.id) setMyId(newSocket.id);
      const name = localStorage.getItem('name');
      if (name) {
        newSocket.emit('register-name', name);
      }
    });

    newSocket.on('private-message', ({ from, message }) => {
      setMessages(prev => [...prev, `From ${from}: ${message}`]);
    });

    newSocket.on('online-users', (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [authorized]);

  // ✅ Fetch message history when target changes
  useEffect(() => {
    if (targetName) {
      fetch(`https://mongorailwaytry-production.up.railway.app/messages/${localStorage.getItem('name')}/${targetName}`)
        .then(res => res.json())
        .then(data => {
          const formatted = data.map((m: any) =>
            m.from === localStorage.getItem('name')
              ? `To ${m.to}: ${m.message}`
              : `From ${m.from}: ${m.message}`
          );
          setMessages(formatted);
        });
    }
  }, [targetName]);

  const handleSend = () => {
    if (!socket) return;
    const trimmed = message.trim();
    const nameTrimmed = targetName.trim();
    if (trimmed && nameTrimmed) {
      socket.emit('private-message', { targetName: nameTrimmed, message: trimmed });
      setMessages(prev => [...prev, `To ${nameTrimmed}: ${trimmed}`]);
      setMessage('');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!authorized) return null;

  return (
   
  <div className="flex h-screen">
    {/* Sidebar - Users */}
    <aside className="w-64 bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      <ul>
        {onlineUsers.length === 0 ? (
          <li className="text-gray-500">No users online</li>
        ) : (
          onlineUsers.map((user) => (
            <li
              key={user}
              className={`px-4 py-2 rounded mb-2 cursor-pointer hover:bg-blue-100 ${
                user === targetName ? 'bg-blue-200 font-semibold' : ''
              } ${user === localStorage.getItem('name') ? 'text-blue-500 font-bold' : ''}`}
              onClick={() => setTargetName(user)}
            >
              {user}
            </li>
          ))
        )}
      </ul>
    </aside>

    {/* Chat Area */}
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">
          {targetName ? `Chatting with ${targetName}` : 'Select a user to start chatting'}
        </h2>
        <p className="text-sm text-gray-500">Your ID: {myId}</p>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 space-y-2">
        {messages.map((msg, i) => {
          const isMine = msg.startsWith('To');
          return (
            <div
              key={i}
              className={`max-w-xs px-4 py-2 rounded-lg ${
                isMine
                  ? 'ml-auto bg-blue-500 text-white text-right'
                  : 'mr-auto bg-gray-200 text-black'
              }`}
            >
              {msg.replace(/^To |^From /, '')}
            </div>
          );
        })}
      </div>

      {/* Message input */}
      <div className="border-t p-4 bg-white">
        <div className="flex space-x-2">
          <input
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  </div>
)

}
