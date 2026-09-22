/**
 * Command Types & Context Definitions
 */

export interface CommandContext {
  sock?: any;
  m?: any;
  user: any;
  group?: any;
  args: string[];
  text: string;
  command: string;
  prefix: string;
  isOwner: boolean;
  isPremium: boolean;
  isPartner: boolean;
  isGroup: boolean;
  isAdmin: boolean;
  isBotAdmin: boolean;
  reply: (text: string, options?: any) => Promise<any>;
  react?: (emoji: string) => Promise<any>;
}

export interface BotCommand {
  name: string;
  aliases?: string[];
  category: string;
  description: string;
  usage?: string;
  limitCost?: number;
  premiumOnly?: boolean;
  ownerOnly?: boolean;
  groupOnly?: boolean;
  adminOnly?: boolean;
  execute: (ctx: CommandContext) => Promise<any>;
}
