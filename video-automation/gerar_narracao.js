require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const blocks = [
  {
    nome: '01_cadastro',
    texto: 'Vamos começar criando uma conta no Baby Diary. Basta clicar em "Cadastrar", preencher seu nome, e-mail e senha, e pronto!'
  },
  {
    nome: '02_onboarding',
    texto: 'Agora, vamos cadastrar o bebê. Informe o nome, data de nascimento e selecione o gênero. Clique em "Adicionar meu bebê" para continuar.'
  },
  {
    nome: '03_memorias',
    texto: 'No menu Memórias, você pode registrar momentos especiais do seu bebê. Clique em "Nova Memória", preencha o título e a descrição, e salve.'
  },
  {
    nome: '04_marcos',
    texto: 'Em Marcos, registre conquistas importantes, como o primeiro sorriso. Clique em "Novo Marco", preencha os campos e salve.'
  },
  {
    nome: '05_atividades',
    texto: 'No menu Atividades, registre rotinas como sono, alimentação e brincadeiras. Clique em "Nova Atividade", preencha os detalhes e salve.'
  },
  {
    nome: '06_ia',
    texto: 'Use o Assistente IA para tirar dúvidas sobre o desenvolvimento do seu bebê. Basta digitar sua pergunta e aguardar a resposta.'
  },
  {
    nome: '07_perfil',
    texto: 'No Perfil, você pode editar seus dados, trocar foto e atualizar informações pessoais.'
  },
  {
    nome: '08_configuracoes',
    texto: 'Em Configurações, altere sua senha e personalize o app conforme sua preferência.'
  },
  {
    nome: '09_loja',
    texto: 'Na Loja, explore produtos, adicione ao carrinho e finalize sua compra de forma simples e rápida.'
  }
];

async function gerarNarracao(texto, nomeArquivo, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await axios.post(
    url,
    {
      text: texto,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.7 }
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    }
  );
  fs.writeFileSync(nomeArquivo, response.data);
  console.log(`Narração salva em ${nomeArquivo}`);
}

(async () => {
  for (const bloco of blocks) {
    await gerarNarracao(bloco.texto, `narration/${bloco.nome}.mp3`);
  }
})();