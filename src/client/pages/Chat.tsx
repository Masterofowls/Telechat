import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Chat: React.FC = () => {
  const { currentChat, messages } = useSelector((state: RootState) => state.chat);

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">{currentChat.title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full p-2 rounded-md border"
        />
      </div>
    </div>
  );
};

export default Chat;
