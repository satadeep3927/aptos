import { createOpenAI } from "@ai-sdk/openai";
import { customProvider } from "ai";

import {
  COPILOT_BASE_URL,
  COPILOT_HEADERS,
  COPILOT_MODELS,
  COPILOT_TOKEN_URL,
  DEFAULT_COPILOT_MODEL,
} from "./constants";

// ---------------------------------------------------------------------------
// Token cache – exchanged GitHub PAT → short-lived Copilot access token
// ---------------------------------------------------------------------------

let _copilotToken = "";
let _copilotTokenExpiresAt = 0;

/**
 * Exchange a GitHub Personal Access Token for a short-lived Copilot access
 * token.  The result is cached and only refreshed when it expires (with a
 * 60-second buffer), mirroring the Python `_refresh_copilot_token` method.
 */
async function refreshCopilotToken(githubToken: string): Promise<string> {
  const now = Date.now() / 1000;
  if (_copilotToken && now < _copilotTokenExpiresAt - 60) {
    return _copilotToken;
  }

  const response = await fetch(COPILOT_TOKEN_URL, {
    headers: {
      authorization: `token ${githubToken}`,
      ...COPILOT_HEADERS,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to obtain Copilot access token: ${response.status} - ${await response.text()}`
    );
  }

  const payload = (await response.json()) as {
    token?: string;
    expires_at?: number;
  };

  if (!payload.token) {
    throw new Error("Copilot token response did not contain a token.");
  }

  _copilotToken = payload.token;
  _copilotTokenExpiresAt = Number(payload.expires_at ?? 0);

  return _copilotToken;
}

// ---------------------------------------------------------------------------
// Resolve GitHub token from argument or environment
// ---------------------------------------------------------------------------

function resolveGithubToken(token?: string): string {
  if (token) return token;

  const env = process.env.GITHUB_COPILOT_TOKEN;
  if (!env) {
    throw new Error(
      "GitHub token not provided. " +
        "Pass `githubToken` to createCopilot() or set the GITHUB_COPILOT_TOKEN environment variable."
    );
  }
  return env;
}

// ---------------------------------------------------------------------------
// Provider factory
// ---------------------------------------------------------------------------

export interface CopilotProviderOptions {
  /**
   * A GitHub Personal Access Token (classic) with `copilot` scope.
   * Falls back to the `GITHUB_COPILOT_TOKEN` environment variable.
   */
  githubToken?: string;
}

/**
 * Create a Copilot AI SDK provider.
 *
 * The returned provider is OpenAI-compatible and points at the GitHub Copilot
 * API.  A custom `fetch` transparently handles the token exchange and refresh
 * lifecycle so callers never deal with short-lived Copilot tokens.
 *
 * @example
 * ```ts
 * import { copilot } from "@/lib/providers/copilot";
 * import { generateText } from "ai";
 *
 * const { text } = await generateText({
 *   model: copilot("gpt-4.1"),
 *   prompt: "Hello!",
 * });
 * ```
 */
export function createCopilot(options: CopilotProviderOptions = {}) {
  const githubToken = resolveGithubToken(options.githubToken);

  const copilotOpenAI = createOpenAI({
    baseURL: COPILOT_BASE_URL,
    apiKey: "copilot-placeholder", // overridden per-request by custom fetch
    name: "copilot",
    headers: COPILOT_HEADERS,
    fetch: async (url, init) => {
      const token = await refreshCopilotToken(githubToken);

      const headers = new Headers(init?.headers);
      headers.set("authorization", `Bearer ${token}`);

      return fetch(url, { ...init, headers });
    },
  });

  const languageModels = Object.fromEntries(
    COPILOT_MODELS.map((id) => [id, copilotOpenAI.chat(id)])
  );

  return customProvider({
    languageModels,
    fallbackProvider: copilotOpenAI,
  });
}

/**
 * Default Copilot provider instance.
 * Reads the GitHub token from the `GITHUB_COPILOT_TOKEN` env var at call time.
 *
 * @example
 * ```ts
 * import { copilot } from "@/lib/providers/copilot";
 * import { generateText } from "ai";
 *
 * const { text } = await generateText({
 *   model: copilot("gpt-4.1"),
 *   prompt: "Hello!",
 * });
 * ```
 */
export const copilot = createCopilot();

export { DEFAULT_COPILOT_MODEL };
