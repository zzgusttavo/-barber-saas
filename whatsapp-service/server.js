const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const pino = require('pino');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3005;

let sock = null;
let currentQR = null;
let currentPairingCode = null;
let isConnected = false;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            currentQR = await qrcode.toDataURL(qr);
            console.log('[WHATSAPP] Novo QR Code gerado.');
        }

        if (connection === 'close') {
            isConnected = false;
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('[WHATSAPP] Conexão fechada. Reconectando:', shouldReconnect);
            
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                console.log('[WHATSAPP] Desconectado. Apagando sessão local...');
                fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                currentQR = null;
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            isConnected = true;
            currentQR = null;
            currentPairingCode = null;
            console.log('[WHATSAPP] CONECTADO AO WHATSAPP COM SUCESSO!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Chatbot auto-responder
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const sender = msg.key.remoteJid;
        const pushName = msg.pushName || 'Cliente';

        const textLower = text.toLowerCase();
        if (textLower.includes('oi') || textLower.includes('ola') || textLower.includes('agendar')) {
            console.log(`[CHATBOT] Recebido "Oi" de ${sender}. Respondendo com link...`);
            
            await sock.presenceSubscribe(sender);
            await sock.sendPresenceUpdate('composing', sender);
            
            setTimeout(async () => {
                // Descobrir qual barbearia é dona deste robô
                let myJid = sock.user.id.split(':')[0].split('@')[0];
                if (myJid.startsWith('55')) myJid = myJid.substring(2); // tira o 55
                
                // Pega todas as barbearias e acha a que o telefone bate
                const shops = await prisma.barbershop.findMany();
                let foundSlug = shops.length > 0 ? shops[0].slug : "sua-barbearia"; // fallback real
                
                for (const b of shops) {
                    const cleanDbPhone = b.phone?.replace(/[^0-9]/g, '');
                    if (cleanDbPhone && (cleanDbPhone === myJid || cleanDbPhone.includes(myJid.substring(2)))) {
                        foundSlug = b.slug;
                        break;
                    }
                }

                const link = `https://barber-saas-alpha.vercel.app/agendar/${foundSlug}`;
                const reply = `Olá ${pushName}! ✂️\n\nPara agendar seu horário, é só clicar no link abaixo de forma rápida e automática:\n👉 ${link}\n\nFicamos no aguardo!`;
                await sock.sendMessage(sender, { text: reply });
                await sock.sendPresenceUpdate('paused', sender);
            }, 1500);
        }
    });
}

connectToWhatsApp();

// API Endpoints

// 1. Get QR Code
app.get('/qr', (req, res) => {
    if (isConnected) return res.json({ status: 'connected' });
    if (currentQR) return res.json({ status: 'pending', qr: currentQR });
    return res.json({ status: 'loading' });
});

// 2. Request Pairing Code (Mobile-First)
app.post('/pair', async (req, res) => {
    if (isConnected) return res.json({ status: 'connected' });
    
    try {
        const { phone } = req.body; // e.g. 5511999999999
        if (!phone) return res.status(400).json({ error: 'Número de telefone é obrigatório' });
        
        // Remove caracteres não numéricos
        let cleanPhone = phone.replace(/[^0-9]/g, '');
        
        // Se a pessoa digitou apenas DDD + Número (10 ou 11 dígitos), adiciona o 55 do Brasil
        if (cleanPhone.length === 10 || cleanPhone.length === 11) {
            cleanPhone = '55' + cleanPhone;
        }
        
        console.log(`[WHATSAPP] Solicitando Pairing Code para o número: ${cleanPhone}`);
        const code = await sock.requestPairingCode(cleanPhone);
        
        // O Baileys retorna ex: "ABCDEFGH", formatamos para ABCD-EFGH
        const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
        currentPairingCode = formattedCode;
        
        return res.json({ status: 'pending', code: formattedCode });
    } catch (err) {
        console.error('[WHATSAPP] Erro ao gerar Pairing Code:', err);
        return res.status(500).json({ error: 'Falha ao gerar código de pareamento' });
    }
});

// 3. Send Message Webhook
app.post('/send', async (req, res) => {
    if (!isConnected) return res.status(400).json({ error: 'WhatsApp não está conectado' });
    
    try {
        const { number, message } = req.body;
        // Format number to JID (5511999999999@s.whatsapp.net)
        let cleanPhone = number.replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10 || cleanPhone.length === 11) {
            cleanPhone = '55' + cleanPhone;
        }
        const jid = `${cleanPhone}@s.whatsapp.net`;
        
        console.log(`[WHATSAPP] Disparando mensagem automática para ${jid}`);
        
        await sock.sendPresenceUpdate('composing', jid);
        setTimeout(async () => {
            await sock.sendMessage(jid, { text: message });
            await sock.sendPresenceUpdate('paused', jid);
        }, 1200);

        return res.json({ success: true });
    } catch (err) {
        console.error('[WHATSAPP] Erro ao enviar mensagem:', err);
        return res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }
});

app.listen(PORT, () => {
    console.log(`[WHATSAPP SERVICE] Servidor rodando na porta ${PORT}`);
});
