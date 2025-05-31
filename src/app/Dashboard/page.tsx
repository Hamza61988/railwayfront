'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { FaDeleteLeft } from "react-icons/fa6";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState('');
  const [targetName, setTargetName] = useState('');
  const [messages, setMessages] = useState<{ id: string; text: string; isMine: boolean }[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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
      const name = localStorage.getItem('name');
      if (name) {
        newSocket.emit('register-name', name);
      }
    });

    newSocket.on('private-message', ({ from, message }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: `From ${from}: ${message}`, isMine: false }
      ]);
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

  useEffect(() => {
    if (targetName) {
      fetch(`https://mongorailwaytry-production.up.railway.app/messages/${localStorage.getItem('name')}/${targetName}`)
        .then((res) => res.json())
        .then((data) => {
          const formatted = data.map((m: any) => ({
            id: m._id,
            text: m.from === localStorage.getItem('name')
              ? `To ${m.to}: ${m.message}`
              : `From ${m.from}: ${m.message}`,
            isMine: m.from === localStorage.getItem('name'),
          }));
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
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: `To ${nameTrimmed}: ${trimmed}`, isMine: true }
      ]);
      setMessage('');
    }
  };

 

  if (loading) return <div>Loading...</div>;
  if (!authorized) return null;

  const currentUser = localStorage.getItem('name');

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-white border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Online Users</h2>
        <ul>
          {onlineUsers.length === 0 ? (
            <li className="text-gray-500">No users online</li>
          ) : (
            onlineUsers.map((user) => {
              const isMe = user === currentUser;
              return (
                <li
                  key={user}
                  className={`px-4 py-2 rounded mb-2 cursor-pointer hover:bg-blue-100 ${
                    user === targetName ? 'bg-blue-200 font-semibold' : ''
                  } ${isMe ? 'text-blue-500 font-bold' : ''}`}
                  onClick={() => setTargetName(user)}
                >
                  {user} {isMe && <span className="text-sm text-gray-500">(me)</span>}
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="px-6 py-4 flex text-center justify-center border-b bg-gray-100">
          <h2 className="text-4xl font-bold">
            {targetName ? `Chatting with ${targetName}` : 'Select a user to start chatting'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-10 bg-gray-50 space-y-4">
          {!targetName ? (
            <div className="mt-10 text-center text-gray-700">
              <h2 className="text-4xl font-bold mb-4">New to the Chat App?</h2>
              <p className="mb-6 text-gray-500">Here’s what you need to know:</p>
              <div className='bg-gray-300 flex justify-center text-center mt-10 p-10'>
                <ul className="text-left space-y-2 list-disc list-inside">
                  <li><b>Built with:</b> Next.js frontend & Express backend</li>
                  <li><b>Real-time messaging:</b> Powered by Socket.IO</li>
                  <li><b>Data storage:</b> Message history is saved in MongoDB</li>
                  <li><b>Online status:</b> See who's online on the left panel</li>
                  <li><b>Try it out:</b> Open another browser, sign in with another account, and chat in real-time!</li>
                  <li><b>Authentication:</b> You can’t just visit <code className="bg-gray-200 px-2 py-1 rounded ml-1">/Dashboard</code> — JWT login is required.</li>
                </ul>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">This is the start of your conversation</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-2 items-center">
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.isMine
                    ? 'ml-auto bg-blue-500 text-white text-right'
                    : 'mr-auto bg-gray-200 text-black'
                }`}>
                  {msg.text.replace(/^To |^From /, '')}
                </div>
             
              </div>
            ))
          )}
        </div>

        {targetName && (
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
                disabled={message.trim() === ''}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg "
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
