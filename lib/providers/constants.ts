/**
 * Default headers required by the GitHub Copilot API.
 * These mimic a legitimate editor client so the API accepts requests.
 */
export const COPILOT_HEADERS: Record<string, string> = {
  "editor-version": "vscode/1.104.0",
  "editor-plugin-version": "copilot.vim/1.16.0",
  "user-agent": "GithubCopilot/1.155.0",
  "Copilot-Vision-Request": "true",
};

/** Copilot token exchange endpoint. */
export const COPILOT_TOKEN_URL =
  "https://api.github.com/copilot_internal/v2/token";

/** Copilot API base URL (OpenAI-compatible). */
export const COPILOT_BASE_URL = "https://api.githubcopilot.com/";

/** Default model ID when none is specified. */
export const DEFAULT_COPILOT_MODEL = "gpt-4.1";

/** All available Copilot model IDs. */
export const COPILOT_MODELS = [
  // OpenAI GPT
  "gpt-4.1",
  "gpt-4.1-2025-04-14",
  "gpt-41-copilot",
  "gpt-4o",
  "gpt-4o-2024-11-20",
  "gpt-4o-mini",
  "gpt-5.1",
  "gpt-5.1-codex-max",
  "gpt-5.2",
  "gpt-5.2-codex",
  "gpt-5.3-codex",
  "gpt-5.4",
  "gpt-5.4-mini",
  "gpt-5-mini",

  // Claude (Anthropic)
  "claude-sonnet-4",
  "claude-sonnet-4.5",
  "claude-sonnet-4.6",
  "claude-opus-4.5",
  "claude-opus-4.6",
  "claude-haiku-4.5",

  // Gemini (Google)
  "gemini-2.5-pro",
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",

  // Grok (xAI)
  "grok-code-fast-1",
] as const;

export type CopilotModelId = (typeof COPILOT_MODELS)[number];
