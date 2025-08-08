import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface MealQnAResult {
  restrictions: string;
  breakfast: { description: string };
  lunch: { description: string };
  afternoon_snack: { description: string };
  dinner: { description: string };
  supper: { description: string };
}

interface SofiaMealQnAChatProps {
  onComplete: (result: MealQnAResult) => void;
}

type ChatMessage = { id: string; role: 'assistant' | 'user'; content: React.ReactNode };

export const SofiaMealQnAChat: React.FC<SofiaMealQnAChatProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'm1', role: 'assistant', content: (
      <div>
        Oi! Sou a <strong>Sofia</strong>. Vou te fazer algumas perguntas rápidas para montar seu cardápio de hoje.
      </div>
    )
  }]);
  const [step, setStep] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const viewportRef = useRef<HTMLDivElement>(null);

  const resultRef = useRef<MealQnAResult>({
    restrictions: '',
    breakfast: { description: '' },
    lunch: { description: '' },
    afternoon_snack: { description: '' },
    dinner: { description: '' },
    supper: { description: '' },
  });

  const questions = useMemo(() => [
    { key: 'restrictions', text: 'Você possui alguma alergia/intolerância ou restrição alimentar? (Ex.: lactose, glúten, vegan)', placeholder: 'Descreva aqui' },
    { key: 'breakfast.description', text: 'O que você quer no café da manhã?', placeholder: 'Ex.: ovos mexidos + fruta' },
    { key: 'lunch.description', text: 'O que você deseja no almoço?', placeholder: 'Ex.: frango + arroz + salada' },
    { key: 'afternoon_snack.description', text: 'O que prefere no café da tarde?', placeholder: 'Ex.: iogurte + fruta' },
    { key: 'dinner.description', text: 'O que deseja no jantar?', placeholder: 'Ex.: peixe + legumes' },
    { key: 'supper.description', text: 'E para a ceia, prefere o quê?', placeholder: 'Ex.: chá + fruta' },
  ], []);

  const askNext = (nextStep: number) => {
    if (nextStep >= questions.length) {
      onComplete(resultRef.current);
      return;
    }
    const q = questions[nextStep];
    setMessages(prev => [...prev, { id: `a${nextStep}`, role: 'assistant', content: <div>{q.text}</div> }]);
  };

  const updateResultByKey = (key: string, value: string) => {
    if (key === 'restrictions') {
      resultRef.current.restrictions = value;
      return;
    }
    const [meal] = key.split('.') as [keyof MealQnAResult];
    (resultRef.current[meal] as any).description = value;
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const q = questions[step];
    setMessages(prev => [
      ...prev,
      { id: `u${step}`, role: 'user', content: <div>{trimmed}</div> }
    ]);
    updateResultByKey(q.key, trimmed);
    setInput('');
    const next = step + 1;
    setStep(next);
    askNext(next);
  };

  React.useEffect(() => {
    askNext(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="flex flex-col h-80 border rounded-md">
      <div ref={viewportRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20">
        {messages.map(m => (
          <div key={m.id} className={`max-w-[85%] rounded px-3 py-2 text-sm ${m.role === 'assistant' ? 'bg-white text-foreground' : 'bg-primary text-primary-foreground ml-auto'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-2 border-t bg-background">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder={questions[step]?.placeholder || 'Digite sua resposta'} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
        <Button onClick={handleSend}>Enviar</Button>
      </div>
    </div>
  );
};

export default SofiaMealQnAChat;


