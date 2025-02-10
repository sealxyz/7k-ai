'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Sui Blockchain',
      label: 'What is the Sui Blockchain?',
      action: 'What is the Sui Blockchain?',
    },
    {
      title: 'Bluefin Exchange',
      label: `What is Bluefin Exchange?`,
      action: `What is Bluefin Exchange?`,
    },
    {
      title: 'Cetus exchange',
      label: `What is Cetus exchange?`,
      action: `What is Cetus exchange?`,
    },
    {
      title: 'Move smart contracts language',
      label: 'What is Move smart contracts language?',
      action: 'What is Move smart contracts language?',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">

    <div className="w-full text-center bg-background text-foreground py-6 mb-4 rounded-md">
      <h1 className="text-2xl font-bold">
        Welcome Anon to 7K-AI Sui Typhoon Chatbot!
      </h1>
    </div>

    <div className="grid sm:grid-cols-2  w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
