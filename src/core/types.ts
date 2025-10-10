import type { z } from 'zod';

/**
 * Configuration for creating tools
 */
export interface ToolConfig<TParameters extends z.ZodSchema = z.ZodSchema> {
  name: string;
  description: string;
  parameters: TParameters;
}

/**
 * Base interface for wallet clients
 */
export interface WalletClientBase {
  getAddress(): string;
  getNetwork(): string;
}