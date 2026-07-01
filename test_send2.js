const message = "Fala parceiro! Agora sim foi com o 55! 🚀 Se você recebeu isso, está 100% testado!";
fetch('http://127.0.0.1:3005/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: "5562998430017", message })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
