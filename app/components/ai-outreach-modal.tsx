'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AIConversation } from './ai-conversation';
import { useAICommunication } from '@/hooks/use-ai-communication';
import { Loader2, Bot, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AIOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: {
    id: string;
    businessName: string;
    contactName: string;
    email: string;
    phone?: string;
  };
  onSendOutreach?: (activity: any) => void;
}

export function AIOutreachModal({
  isOpen,
  onClose,
  prospect,
  onSendOutreach,
}: AIOutreachModalProps) {
  const [activeTab, setActiveTab] = useState('generate');
  const [outreachType, setOutreachType] = useState('EMAIL');
  const [generatedContent, setGeneratedContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [subject, setSubject] = useState('');
  
  const { generateInitialOutreach, isLoading } = useAICommunication();

  const handleGenerateOutreach = async () => {
    try {
      const content = await generateInitialOutreach(prospect.id);
      setGeneratedContent(content);
      setEditedContent(content);
      setSubject(`Funding Opportunities for ${prospect.businessName}`);
      toast.success('AI outreach message generated!');
    } catch (error) {
      toast.error('Failed to generate outreach message');
    }
  };

  const handleSendOutreach = async () => {
    if (!editedContent.trim()) {
      toast.error('Please generate or write a message first');
      return;
    }

    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId: prospect.id,
          type: outreachType,
          subject,
          content: editedContent,
          status: 'SENT',
          sentAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send outreach');

      const data = await response.json();
      toast.success('Outreach sent successfully!');
      onSendOutreach?.(data);
      onClose();
    } catch (error) {
      toast.error('Failed to send outreach');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>AI-Powered Outreach for {prospect.businessName}</DialogTitle>
          <DialogDescription>
            Generate personalized outreach messages or have real-time AI conversations
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Outreach
            </TabsTrigger>
            <TabsTrigger value="conversation">
              <Bot className="w-4 h-4 mr-2" />
              AI Conversation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label>Outreach Type</Label>
              <Select value={outreachType} onValueChange={setOutreachType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="LINKEDIN">LinkedIn Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!generatedContent ? (
              <Card className="p-6 text-center">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Generate a personalized outreach message for {prospect.contactName} at {prospect.businessName}
                </p>
                <Button 
                  onClick={handleGenerateOutreach} 
                  disabled={isLoading}
                  className="mx-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Message
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Email subject..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={10}
                    placeholder="Edit the generated message..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGenerateOutreach}
                    disabled={isLoading}
                  >
                    Regenerate
                  </Button>
                  <Button onClick={handleSendOutreach}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Outreach
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="conversation" className="h-[500px]">
            <AIConversation
              prospectId={prospect.id}
              prospectName={prospect.businessName}
              onSendMessage={(message) => {
                // Auto-save conversation as outreach activity
                fetch('/api/outreach', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    prospectId: prospect.id,
                    type: 'CHAT',
                    subject: 'AI Conversation',
                    content: message,
                    status: 'SENT',
                    sentAt: new Date().toISOString(),
                  }),
                });
              }}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}