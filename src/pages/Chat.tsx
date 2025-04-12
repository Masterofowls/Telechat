import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useChat } from '../hooks/useChat';
import { useTyping } from '../hooks/useTyping';
import { useFileUpload } from '../hooks/useFileUpload';
import ChatList from '../components/ChatList';
import MessageList from '../components/MessageList';
import ChatHeader from '../components/ChatHeader';
import TypingIndicator from '../components/TypingIndicator';
import FileUploadButton from '../components/FileUploadButton';
import anime from 'animejs';

export default function Chat() {
  const { id: chatId } = useParams();
  const { messages, chat, members, loading, sendMessage } = useChat(chatId);
  const { typingUsers, handleTyping } = useTyping(chatId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      anime({
        targets: messageEndRef.current,
        scrollTop: messageEndRef.current.scrollHeight,
        duration: 800,
        easing: 'easeInOutQuad'
      });
    }
  }, [messages]);

  const { uploadFile } = useFileUpload();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    try {
      setSending(true);

      if (selectedFile) {
        const { filePath, fileName, fileSize, fileType } = await uploadFile(selectedFile, chatId!);
        await sendMessage({
          type: 'file',
          content: '',
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType
        });
        setSelectedFile(null);
      } else {
        await sendMessage({
          type: 'text',
          content: newMessage.trim()
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Chat list sidebar */}
      <div className="w-80 border-r border-border">
        <ChatList activeChatId={chatId} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {chat ? (
          <>
            <ChatHeader chat={chat} members={members} />
            
            {/* Messages */}
            <div 
              ref={messageEndRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              <MessageList messages={messages} />
              <TypingIndicator userIds={typingUsers as string[]} />
            </div>

            {/* Message input */}
            <form 
              onSubmit={handleSend}
              className="p-4 border-t border-border"
            >
              <div className="flex space-x-2">
                <FileUploadButton
                  chatId={chatId!}
                  onFileSelect={setSelectedFile}
                  disabled={sending}
                />
                <div className="flex-1">
                  {selectedFile ? (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-accent rounded">
                      <span className="text-sm truncate">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      className="flex-1"
                    />
                  )}
                </div>
                <Button 
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                >
                  <FiSend className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
