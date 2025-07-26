import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Mail,
  Plus
} from "lucide-react";

interface ComposeEmailProps {
  customerEmail: string;
  customerName: string;
  concernSubject: string;
  onSendEmail: (emailData: {
    to: string;
    subject: string;
    content: string;
  }) => void;
  isLoading?: boolean;
}

export function ComposeEmail({
  customerEmail,
  customerName,
  concernSubject,
  onSendEmail,
  isLoading = false,
}: ComposeEmailProps) {
  const [to, setTo] = useState(customerEmail);
  const [subject, setSubject] = useState(`Re: ${concernSubject}`);
  const [content, setContent] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSend = () => {
    if (!to.trim() || !subject.trim() || !content.trim()) return;
    
    onSendEmail({
      to,
      subject,
      content,
    });
    
    // Reset form after sending
    setContent("");
    setIsComposing(false);
  };

  const handleStartComposing = () => {
    setIsComposing(true);
  };

  const handleCancel = () => {
    setIsComposing(false);
    setContent("");
    setTo(customerEmail);
    setSubject(`Re: ${concernSubject}`);
  };

  if (!isComposing) {
    return (
      <div className="space-y-4">

        
        <Card className="bg-card">
          <CardContent className=" p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-950/20 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No email correspondence yet</h3>
                <p className="text-muted-foreground text-sm">
                  Start an email conversation with {customerName} about their concern.
                </p>
              </div>
              <Button 
                onClick={handleStartComposing}
                className="gap-2"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                Compose Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Compose Email</h2>
      </div>
      
      <Card className="">
        <CardHeader>
      
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[200px] resize-none"
            />
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSend}
                disabled={!to.trim() || !subject.trim() || !content.trim() || isLoading}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
