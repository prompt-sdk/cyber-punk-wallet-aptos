'use client';

import { Attachment, ToolInvocation } from 'ai';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { ReactNode, useState } from 'react';

import BoderImage from '@/components/common/border-image';
import AngleDownIcon from '@/public/assets/svgs/angle-down-icon.svg';
import BotIcon from '@/public/assets/svgs/bot-icon.svg';
import UserIcon from '@/public/assets/svgs/user-icon.svg';

import { Markdown } from './markdown';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import '@/components/augmented/style.css';

import { SmartAction } from './onchain'
import { ViewFrame } from './view-frame'

export const Message = ({
  sender,
  username,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  sender: string;
  username: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev); // Toggle the collapse state
  };

  const sliceAddress = (address: string): string => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={role}
    >
      <div className={classNames('flex gap-4', role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
        {role === 'user' ?
          <Image
            src={UserIcon.src}
            alt="User Icon"
            width={UserIcon.width}
            height={UserIcon.height}
            className="size-10 shrink-0"
          /> :
          <Image
            src={BotIcon.src}
            alt="Bot Icon"
            width={BotIcon.width}
            height={BotIcon.height}
            className="size-10 shrink-0"
          />}

        <div className="grow">
          <BoderImage
            className={classNames('border-0 text-gray-400', role === 'user' ? 'text-right' : '')}
          >
            <div
              className={classNames(
                'flex items-center justify-between border-b-[1px] border-[#292F36] px-4 py-3',
                role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={classNames('grow font-bold', role === 'user' ? '' : 'text-cyan-500')}>
                {role === 'user' ? sliceAddress(username) : sliceAddress(sender)}
              </div>
              <button className="shrink-0" onClick={toggleCollapse}>
                <Image
                  src={AngleDownIcon.src}
                  alt="Angle Down Icon"
                  width={AngleDownIcon.width}
                  height={AngleDownIcon.height}
                  className="translate-y-1"
                />
              </button>
            </div>

            <motion.div
              className="overflow-hidden "
              // initial={{ height: 0 }}
              animate={{ height: isCollapsed ? 0 : 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-3">
                {content && (
                  <div className="flex flex-col gap-4">
                    <Markdown>{content as string}</Markdown>
                  </div>
                )}
                {toolInvocations && toolInvocations.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {toolInvocations.map((toolInvocation) => {
                      const { toolName, toolCallId, state, args } = toolInvocation;
                      const [typeTool, typeFunction] = toolName.split("_")

                      if (state === 'result') {
                        const { result } = toolInvocation;

                        return (
                          <div key={toolCallId}>
                            {typeTool == 'widgetTool' ? <ViewFrame code={result} /> :
                              `Calling ${typeTool == 'contractTool' ? 'Contract' :
                                typeTool == 'widgetTool' ? 'Widget' :
                                  typeTool == 'apiTool' ? 'API Tool' :
                                    'unknow Tool'}
                                    ${toolCallId}`}

                          </div>
                        );
                      } else {
                        const [typeTool, typeFunction, typeAddress, functionName] = toolName.split("_")
                        console.log(toolName)
                        return (
                          <div key={toolCallId} className="skeleton">
                            Calling tool {toolCallId}
                            {typeTool == 'contractTool' && typeFunction == 'entry' ? <SmartAction props={args} functionName={functionName} /> : ""}

                          </div>
                        );
                      }
                    })}
                  </div>
                ) : null}

                {attachments && (
                  <div className="flex flex-row gap-2">
                    {attachments.map((attachment) => (
                      <PreviewAttachment
                        key={attachment.url}
                        attachment={attachment}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </BoderImage>
        </div>
        <div className="size-10 shrink-0" />
      </div>
    </motion.div >
  );
};
