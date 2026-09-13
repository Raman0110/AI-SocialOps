import type { MessageAnalysis } from "../types/conversations";
import { request } from "./client";

interface AnalyzeMessageRequest {
  message: string;
}

export async function analyzeMessage(message: string): Promise<MessageAnalysis> {
  return request<MessageAnalysis>({
    method: "POST",
    url: "/api/ai/analyze-message",
    data: {
      message,
    } satisfies AnalyzeMessageRequest,
  });
}
