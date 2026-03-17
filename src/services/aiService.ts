import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const getAIResponse = async (prompt: string, userName: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `Você é o assistente inteligente do sistema AiCondo360, uma plataforma de gestão de condomínios. 
    Seu nome é AiCondo Assist. O usuário atual é ${userName}.
    Responda de forma prestativa, profissional e amigável.
    Você pode ajudar com dúvidas sobre boletos, reservas de áreas comuns, registro de ocorrências, pets, consumo de água/gás e regras do condomínio.
    Se o usuário perguntar algo que não sabe, sugira que ele entre em contato com a administração do condomínio.
    Mantenha as respostas curtas e diretas ao ponto.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Quem é você?" }],
        },
        {
          role: "model",
          parts: [{ text: "Eu sou o AiCondo Assist, o assistente inteligente do AiCondo360. Estou aqui para ajudar você com a gestão do seu condomínio." }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 250,
      },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUsuário: ${prompt}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao chamar Gemini AI:", error);
    return "Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente mais tarde.";
  }
};
