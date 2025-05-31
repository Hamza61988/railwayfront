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
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Private Messaging</h2>
      <p className="text-sm text-gray-500 mb-4">Your Socket ID: {myId}</p>

      <div className="mb-4">
        <h3 className="font-semibold mb-1">Online Users</h3>
        <ul className="border p-2 rounded bg-white max-h-32 overflow-auto">
          {onlineUsers.length === 0 ? (
            <li className="text-gray-500">No users online</li>
          ) : (
            onlineUsers.map((user) => (
              <li
                key={user}
                className={`cursor-pointer px-2 py-1 rounded hover:bg-gray-200 ${
                  user === localStorage.getItem('name') ? 'font-bold text-blue-600' : ''
                }`}
                onClick={() => setTargetName(user)}
              >
                {user}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mb-2">
        <input
          className="w-full px-3 py-2 border rounded mb-2"
          placeholder="Target User Name"
          value={targetName}
          onChange={(e) => setTargetName(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter private message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send Private Message
        </button>
      </div>

      <div className="mt-4 border p-3 h-48 overflow-y-auto bg-gray-100 rounded">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm mb-1">{msg}</div>
        ))}
      </div>
    </div>
  );
}
