
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, Search } from 'lucide-react';

type Message = Tables<'messages'> & {
  sender: Tables<'profiles'>;
  receiver: Tables<'profiles'>;
  listing?: Tables<'listings'>;
};

type Conversation = {
  otherUser: Tables<'profiles'>;
  lastMessage: Message;
  unreadCount: number;
};

const MessagingSystem: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Tables<'profiles'> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*),
        listing:listings(*)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch conversations",
        variant: "destructive"
      });
      return;
    }

    // Group messages by conversation
    const conversationMap = new Map<string, Conversation>();
    
    data?.forEach((message) => {
      const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
      const key = otherUser.id;
      
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          otherUser,
          lastMessage: message,
          unreadCount: message.receiver_id === user.id && !message.is_read ? 1 : 0
        });
      } else {
        const existing = conversationMap.get(key)!;
        if (new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
          existing.lastMessage = message;
        }
        if (message.receiver_id === user.id && !message.is_read) {
          existing.unreadCount++;
        }
      }
    });

    setConversations(Array.from(conversationMap.values()));
    setLoading(false);
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*),
        listing:listings(*)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive"
      });
      return;
    }

    setMessages(data || []);
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', user.id);
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedConversation.id,
        content: newMessage.trim()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return;
    }

    setNewMessage('');
    fetchMessages(selectedConversation.id);
    fetchConversations();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[600px] flex bg-white rounded-lg border overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting with equipment owners!</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.otherUser.id}
                onClick={() => setSelectedConversation(conversation.otherUser)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.otherUser.id ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {conversation.otherUser.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium truncate">{conversation.otherUser.full_name}</p>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessage.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedConversation.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedConversation.full_name}</p>
                  <p className="text-sm text-gray-600">@{selectedConversation.username}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;
