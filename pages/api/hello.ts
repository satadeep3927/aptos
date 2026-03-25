// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { copilot } from "@/lib/providers/copilot";
import { generateText } from "ai";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { text } = await generateText({
    model: copilot.languageModel("gpt-4.1"),
    prompt: "Hello!",
  });
  res.status(200).json({ name: text });
}
