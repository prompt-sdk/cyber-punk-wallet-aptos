'use client';

import { FC } from 'react';
import classNames from 'classnames';

interface IChatPromptItemProps {
  title: string;
  onClick: () => void;
  className?: string;
}

const ChatPromptItem: FC<IChatPromptItemProps> = ({ title, onClick, className }) => {
  return (
    <li className={classNames('flex items-center justify-between', className)} onClick={onClick}>
      <span className="line-clamp-1 max-w-44 grow">{title}</span>
      <button className="ico-more-vertical shrink-0 px-3 text-xl" />
    </li>
  );
};

export default ChatPromptItem;
