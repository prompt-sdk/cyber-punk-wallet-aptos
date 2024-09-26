import { BotChatMessage, ChatMessage, UserChatMessage } from '../interfaces/chat.interface';

import { AI_CHAT_LIST, USERS } from '../constants/chat.constant';

export const simulateBotResponse = (userMessage: string): Promise<string> => {
  return new Promise(resolve => {
    // Simulate a delay for the bot response
    setTimeout(() => {
      const botResponse = `Bot: You said "${userMessage}"`; // Customize the bot response as needed

      resolve(botResponse);
    }, 1000); // Delay for 1 second
  });
};

export const createChatMessage = (msg: UserChatMessage | BotChatMessage): ChatMessage => {
  const creatorName =
    msg.type === 'user'
      ? USERS.find(user => user.id === msg.creatorId)?.name || ''
      : AI_CHAT_LIST.find(user => user.id === msg.creatorId)?.name || '';

  return {
    id: msg.id,
    message: msg.message,
    avatar: '',
    type: msg.type,
    creator: creatorName
  };
};

export const insertNewParagraph = () => {
  const selection = window.getSelection();
  const range = selection?.getRangeAt(0);
  const newParagraph = document.createElement('p');

  newParagraph.innerText = '';

  range?.insertNode(newParagraph);
  range?.setStartAfter(newParagraph);
  if (range) {
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
};
