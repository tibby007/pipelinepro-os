'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAICommunication } from '@/hooks/use-ai-communication';
import { Bot, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIQualificationFlowProps {
  prospectId: string;
  prospectName: string;
  onComplete?: (qualification: any) => void;
}

export function AIQualificationFlow({
  prospectId,
  prospectName,
  onComplete,
}: AIQualificationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [qualification, setQualification] = useState<any>(null);
  
  const {
    generateQualificationQuestions,
    analyzeQualificationResponses,
    isLoading,
  } = useAICommunication();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const generatedQuestions = await generateQualificationQuestions(prospectId);
      setQuestions(generatedQuestions);
    } catch (error) {
      toast.error('Failed to generate qualification questions');
    }
  };

  const handleAnswer = () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    const updatedAnswers = {
      ...answers,
      [questions[currentStep]]: currentAnswer,
    };
    setAnswers(updatedAnswers);
    setCurrentAnswer('');

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      analyzeResponses(updatedAnswers);
    }
  };

  const analyzeResponses = async (allAnswers: Record<string, string>) => {
    try {
      const result = await analyzeQualificationResponses(prospectId, allAnswers);
      setQualification(result);
      
      if (result.qualified) {
        toast.success('Prospect qualified!');
      } else {
        toast.info('Prospect does not meet current qualification criteria');
      }
      
      onComplete?.(result);
    } catch (error) {
      toast.error('Failed to analyze qualification');
    }
  };

  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  if (qualification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {qualification.qualified ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            Qualification Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Score: {qualification.score}/100</h3>
            <p className="text-muted-foreground">{qualification.feedback}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <ul className="list-disc list-inside space-y-1">
              {qualification.nextSteps.map((step: string, index: number) => (
                <li key={index} className="text-sm">{step}</li>
              ))}
            </ul>
          </div>
          
          <Button onClick={() => window.location.reload()} variant="outline">
            Start New Qualification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI-Powered Qualification
        </CardTitle>
        <CardDescription>
          Qualifying {prospectName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {questions.length > 0 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">
                {questions[currentStep]}
              </Label>
            </div>
            
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              className="resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleAnswer();
                }
              }}
            />
            
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter to submit
              </p>
              <Button 
                onClick={handleAnswer} 
                disabled={isLoading || !currentAnswer.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentStep < questions.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Complete Qualification'
                )}
              </Button>
            </div>
          </div>
        )}

        {questions.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading qualification questions...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}