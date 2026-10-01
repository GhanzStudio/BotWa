/**
 * Command Types & Context Definitions
 */

export interface CommandContext {
  sock?: any;
  m?: any;
  senderJid?: string;
  quotedUserJid?: string;
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
  sendAudio?: (audioUrlOrBuffer: string | Buffer, ptt?: boolean, caption?: string) => Promise<any>;
  sendVideo?: (videoUrlOrBuffer: string | Buffer, caption?: string) => Promise<any>;
  sendImage?: (imageUrlOrBuffer: string | Buffer, caption?: string) => Promise<any>;
  sendSticker?: (stickerBufferOrUrl: string | Buffer) => Promise<any>;
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
