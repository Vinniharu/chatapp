'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';

export default function Dashboard() {
  const { user, loading, onlineUsers, signOut } = useAuth();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<{ uid: string; email: string | null } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  const handleSelectUser = (onlineUser: { uid: string; email: string | null }) => {
    if (onlineUser.uid !== user?.uid) {
      setSelectedUser(onlineUser);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Firebase Chat App</h1>
          <div className="flex items-center">
            <p className="mr-4 text-gray-700">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Online Users */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Online Users</h2>
            
            {onlineUsers.length === 0 ? (
              <p className="text-gray-500">No users currently online.</p>
            ) : (
              <div className="space-y-4">
                {onlineUsers
                  .filter(onlineUser => onlineUser.uid !== user.uid) // Filter out the current user
                  .map((onlineUser) => (
                    <div
                      key={onlineUser.uid}
                      className={`bg-gray-50 p-4 rounded-lg flex items-center cursor-pointer hover:bg-gray-100 transition-colors ${selectedUser?.uid === onlineUser.uid ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => handleSelectUser(onlineUser)}
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                      <div>
                        <p className="font-medium">{onlineUser.email || 'Anonymous User'}</p>
                        <p className="text-xs text-gray-500">
                          Online since {new Date(onlineUser.lastSeen).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="md:col-span-2">
            {selectedUser ? (
              <ChatRoom recipient={selectedUser} />
            ) : (
              <div className="bg-white shadow rounded-lg p-6 h-[500px] flex items-center justify-center">
                <p className="text-gray-500 text-lg">Select a user to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 