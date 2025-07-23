'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAICommunication } from '@/hooks/use-ai-communication';
import { FileText, Send, Loader2, Bot } from 'lucide-react';
import { toast } from 'sonner';

interface AIDocumentRequestProps {
  prospectId: string;
  prospectName: string;
  prospectEmail: string;
  qualificationScore?: number;
  onRequestSent?: () => void;
}

const DOCUMENT_TYPES = [
  { id: 'bank_statements', label: 'Bank Statements (3-6 months)', required: true },
  { id: 'tax_returns', label: 'Tax Returns (Last 2 years)', required: false },
  { id: 'business_license', label: 'Business License', required: true },
  { id: 'financial_statements', label: 'Financial Statements', required: false },
  { id: 'merchant_statements', label: 'Merchant Processing Statements', required: false },
  { id: 'lease_agreement', label: 'Lease Agreement', required: false },
];

export function AIDocumentRequest({
  prospectId,
  prospectName,
  prospectEmail,
  qualificationScore = 0,
  onRequestSent,
}: AIDocumentRequestProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>(
    DOCUMENT_TYPES.filter(d => d.required).map(d => d.id)
  );
  const [customMessage, setCustomMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const { generateDocumentRequest, isLoading } = useAICommunication();

  const handleGenerateRequest = async () => {
    try {
      const message = await generateDocumentRequest(prospectId);
      setGeneratedMessage(message);
      setCustomMessage(message);
      toast.success('Document request message generated!');
    } catch (error) {
      toast.error('Failed to generate document request');
    }
  };

  const handleSendRequest = async () => {
    if (!customMessage.trim()) {
      toast.error('Please generate or write a message first');
      return;
    }

    try {
      // Create document records
      const documentPromises = selectedDocs.map(docType => 
        fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prospectId,
            type: docType.toUpperCase(),
            status: 'REQUESTED',
            requestedAt: new Date().toISOString(),
          }),
        })
      );

      await Promise.all(documentPromises);

      // Send the request email
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId,
          type: 'EMAIL',
          subject: `Document Request for ${prospectName}`,
          content: customMessage,
          status: 'SENT',
          sentAt: new Date().toISOString(),
          isAIGenerated: !!generatedMessage,
          aiModel: generatedMessage ? 'openrouter/meta-llama/llama-3.1-70b-instruct' : undefined,
        }),
      });

      toast.success('Document request sent successfully!');
      onRequestSent?.();
    } catch (error) {
      toast.error('Failed to send document request');
    }
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Document Request
        </CardTitle>
        <CardDescription>
          Request necessary documents from {prospectName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-3 block">
            Select Documents to Request
          </Label>
          <div className="space-y-3">
            {DOCUMENT_TYPES.map((doc) => (
              <div key={doc.id} className="flex items-center space-x-2">
                <Checkbox
                  id={doc.id}
                  checked={selectedDocs.includes(doc.id)}
                  onCheckedChange={() => toggleDocument(doc.id)}
                  disabled={doc.required}
                />
                <Label
                  htmlFor={doc.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {doc.label}
                  {doc.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">
            Request Message
          </Label>
          
          {!generatedMessage && (
            <Button
              onClick={handleGenerateRequest}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  Generate AI Message
                </>
              )}
            </Button>
          )}

          {(generatedMessage || customMessage) && (
            <>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
                placeholder="Edit the message..."
                className="resize-none"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateRequest}
                  disabled={isLoading}
                  variant="outline"
                >
                  Regenerate
                </Button>
                <Button
                  onClick={handleSendRequest}
                  disabled={!customMessage.trim() || selectedDocs.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </>
          )}
        </div>

        {qualificationScore > 0 && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Qualification Score: {qualificationScore}/100
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}