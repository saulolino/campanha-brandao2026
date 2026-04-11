/**
 * Helper para chamar o MCP do Instagram via CLI
 * Usa o manus-mcp-cli disponível no ambiente de execução
 */
import { execSync } from "child_process";
import * as fs from "fs";

interface McpPostInsights {
  shares: number;
  comments: number;
  likes: number;
  saved: number;
  total_interactions: number;
  reach: number;
  views: number;
}

interface McpPost {
  id: string;
  type: string;
  caption?: string;
  link: string;
  likes: number;
  comments: number;
  posted: string;
  thumbnail_url?: string;
  media_url?: string;
}

interface McpPostListResult {
  posts: McpPost[];
  next_cursor?: string;
}

interface McpAccountInfo {
  username: string;
  name: string;
  followers_count: number;
  media_count: number;
  biography?: string;
  profile_picture_url?: string;
}

function runMcp(tool: string, input: Record<string, unknown>): unknown {
  const inputJson = JSON.stringify(input);
  const result = execSync(
    `manus-mcp-cli tool call ${tool} --server instagram --input '${inputJson.replace(/'/g, "'\\''")}'`,
    { encoding: "utf-8", timeout: 30000 }
  );
  
  // Encontrar o arquivo de resultado mais recente
  const resultDir = "/tmp/manus-mcp";
  const files = fs.readdirSync(resultDir)
    .filter(f => f.startsWith("mcp_result_") && f.endsWith(".json"))
    .map(f => ({ name: f, time: fs.statSync(`${resultDir}/${f}`).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
  
  if (files.length === 0) throw new Error("Nenhum resultado MCP encontrado");
  
  const content = fs.readFileSync(`${resultDir}/${files[0].name}`, "utf-8");
  return JSON.parse(content);
}

export async function mcpGetAccountInfo(): Promise<McpAccountInfo> {
  const result = runMcp("get_account_info", {}) as McpAccountInfo;
  return result;
}

export async function mcpGetPostList(limit: number = 20): Promise<McpPostListResult> {
  const result = runMcp("get_post_list", { limit }) as McpPostListResult;
  return result;
}

export async function mcpGetPostInsights(postId: string): Promise<McpPostInsights> {
  const result = runMcp("get_post_insights", { post_id: postId }) as McpPostInsights;
  return result;
}
