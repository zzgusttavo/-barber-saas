import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Esse endpoint (Webhook) seria cadastrado na sua Evolution API/Z-API
// Sempre que alguém mandar mensagem no WhatsApp da barbearia, a API avisa esse endpoint.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Extraindo dados da mensagem recebida (Formato base da Evolution API)
    const { instance, data } = body;
    const { key, message, pushName } = data;
    
    // Se a mensagem foi enviada pela própria barbearia, ignoramos
    if (key.fromMe) return NextResponse.json({ status: 'Ignorado (mensagem própria)' });

    // Pegamos o número do cliente e o texto que ele mandou
    const clientPhone = key.remoteJid;
    const textReceived = message?.conversation || message?.extendedTextMessage?.text || "";

    console.log(`[WEBHOOK] Mensagem recebida de ${pushName} (${clientPhone}): ${textReceived}`);

    // 2. Lógica do Chatbot
    // Se o cliente disser "oi", "ola", "agendar", mandamos a saudação com o link
    const textLower = textReceived.toLowerCase();
    
    if (textLower.includes('oi') || textLower.includes('olá') || textLower.includes('agendar')) {
      
      // Montamos a mensagem automática
      // Num cenário real, você buscaria a barbearia pelo "instance" (nome da conexão) no BD
      const barbershopSlug = "teste"; // Link dinâmico
      const linkAgendamento = `https://seusaas.com/agendar/${barbershopSlug}`;

      const replyText = `Olá ${pushName}! ✂️\n\nPara agendar seu horário, é só clicar no link abaixo de forma rápida e automática:\n👉 ${linkAgendamento}\n\nFicamos no aguardo!`;

      console.log(`[WHATSAPP CHATBOT] 🚀 Respondendo para ${clientPhone}: \n${replyText}`);

      // 3. Disparo da Resposta via API (Exemplo)
      /*
      await fetch(`https://api.whatsapp-saas.com/message/sendText/${instance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': 'API_KEY_AQUI' },
        body: JSON.stringify({
          number: clientPhone,
          options: { delay: 1500, presence: 'composing' }, // Simula "digitando..."
          textMessage: { text: replyText }
        })
      });
      */
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
