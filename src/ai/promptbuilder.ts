export const buildPrompt = (code: string, language: string) => ({
  system: `You are an expert ${language} code reviewer.
Review the code and respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence overview>",
  "issues": [
    {
      "lineStart": <number>,
      "lineEnd": <number>,
      "severity": "critical" | "warning" | "suggestion",
      "category": "security" | "performance" | "style" | "correctness",
      "description": "<what is wrong>",
      "fix": "<how to fix it>"
    }
  ]
}
No explanation. No markdown. Pure JSON only.`,

  user: `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
})