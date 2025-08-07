"use client"

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/useToast";
import { Send, Paperclip, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useTabs } from "@/context/TabsContext";
import { getSocket } from "@/utils/socket";
import api from "@/utils/api";

interface ChatInputProps {
  businessId: string;
  sessionId?: string;
  agentId: string;
  escalationId: string;
  onMessageSent: () => void;
  sending: boolean;
  setSending: (sending: boolean) => void;
}

export default function ChatInput({ 
  businessId, 
  sessionId, 
  agentId, 
  escalationId, 
  onMessageSent, 
  sending, 
  setSending 
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addChatMessage } = useTabs();

  const sendMessage = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!sessionId || !agentId) return;
    
    setSending(true);
    setUploading(true);
    
    try {
      // If there's a file, use the send-message-with-file endpoint
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('businessId', businessId);
        formData.append('sessionId', sessionId);
        formData.append('escalationId', escalationId);
        formData.append('senderType', 'agent');
        formData.append('agentId', agentId);
        
        // Add message if provided
        if (input.trim()) {
          formData.append('message', input.trim());
        }
        
        try {
          const response = await api.post('/chat/send-message-with-file', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          toast.success('Message sent successfully');
          setInput("");
          setSelectedFile(null);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          // Add the message to persistent state
          if (response.data?.data) {
            addChatMessage(response.data.data);
          }
          
          onMessageSent();
          
          // Emit typing stopped
          const socket = getSocket();
          socket.emit('agent_stopped_typing', { escalationId, agentId });
          
          setSending(false);
          setUploading(false);
          return;
        } catch (error) {
          console.error('Failed to send message with file:', error);
          toast.error('Failed to send message');
          setSending(false);
          setUploading(false);
          return;
        }
      }
      
      // Send text-only message
      const messageData: any = {
        businessId,
        sessionId,
        senderType: "agent",
        agentId,
        escalationId
      };
      
      if (input.trim()) {
        messageData.message = input.trim();
        messageData.messageType = 'text';
      }

      const response = await api.post("/chat/send-message", messageData);
      
      // Add the message to persistent state (backend will also emit via socket)
      if (response.data?.data) {
        addChatMessage(response.data.data);
      }
      
      setInput("");
      setSelectedFile(null);
      onMessageSent();
      
      // Emit typing stopped
      const socket = getSocket();
      socket.emit('agent_stopped_typing', { escalationId, agentId });

      toast.success('Message sent');    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type - allow images and PDFs
      const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp',
        'application/pdf'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files (JPEG, PNG, GIF, WebP) and PDF documents are supported');
        return;
      }
      
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
    
    // Reset the input so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle typing events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Emit typing event
    const socket = getSocket();
    socket.emit('agent_typing', { escalationId, agentId });
  };

  return (
    <div className="space-y-2">
      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border">
          <div className="flex items-center gap-2 flex-1">
            {selectedFile.type.startsWith('image/') ? (
              <ImageIcon className="h-4 w-4 text-blue-500" />
            ) : (
              <FileText className="h-4 w-4 text-red-500" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeSelectedFile}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Input Area */}
      <form 
        className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2 border" 
        onSubmit={e => { e.preventDefault(); sendMessage(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading}
          className="rounded-full p-1 h-7 w-7"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        <input
          className="flex-1 rounded-full px-3 py-1.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          autoComplete="off"
          disabled={sending || uploading || !sessionId}
        />
        
        <Button
          type="submit"
          size="sm"
          disabled={sending || uploading || (!input.trim() && !selectedFile) || !sessionId}
          className="rounded-full p-2 h-8 w-8"
        >
          {sending || uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
