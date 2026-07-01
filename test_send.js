const message = "Fala parceiro! 🚀 Teste do Robô do Barber SaaS executado com sucesso direto da central! Se você recebeu isso, seu WhatsApp agora é oficialmente um bot conectado!";

fetch('http://127.0.0.1:3005/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: "62998430017", message })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
