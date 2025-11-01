import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const translateText = async (text: string, targetLanguage: string) => {
  if (targetLanguage === "English") return text;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Translate the following text into ${targetLanguage} while keeping the meaning accurate.`,
        },
        { role: "user", content: text },
      ],
      max_tokens: 500,
    });
    return response.choices[0].message?.content || text;
  } catch (err) {
    console.error("Translation error:", err);
    return text;
  }
};