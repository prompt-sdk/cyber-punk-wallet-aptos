'use client';

import { Bot, Plus } from 'lucide-react';
import Link from 'next/link';
import { type User } from 'next-auth';

import { VercelIcon } from '@/components/custom/icons';
import { SidebarHistory } from '@/components/custom/sidebar-history';
import { SidebarUserNav } from '@/components/custom/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { BetterTooltip } from '@/components/ui/tooltip';

export function AppSidebar({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <span className="text-lg font-semibold font-mono tracking-tighter">
                  Chatbot
                </span>
              </Link>
            </SidebarMenuButton>
            <BetterTooltip content="New Chat">
              <SidebarMenuAction asChild>
                <Link href="/" onClick={() => setOpenMobile(false)}>
                  <Plus />
                </Link>
              </SidebarMenuAction>
            </BetterTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <Card className="p-4 flex flex-col gap-4 relative rounded-md border-none shadow-none hover:shadow transition-shadow">
              <a
                href='/agent'
                className="absolute inset-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">Deploy</span>
              </a>
              <CardHeader className="p-0">
                <CardTitle className="text-base">Create Your Agent</CardTitle>
                <CardDescription className="text-sm">
                  Open Source Chatbot template built with Prompt and Onchain tool.
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-0">
                <Button size="sm" className="w-full h-8 py-0 justify-start">
                  <Bot size={16} />
                  Create Agent
                </Button>
              </CardFooter>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>
        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarUserNav user={user} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
