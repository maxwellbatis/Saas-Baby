const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Rode o Playwright para gerar o vídeo completo
echo('Rodando Playwright para gravar o vídeo completo...');
try {
  execSync('node scripts/user_full_demo.js', { stdio: 'inherit' });
} catch (e) {
  echo('Erro ao rodar Playwright. Verifique se o script está correto.');
  process.exit(1);
}

// 2. Defina o nome do vídeo gerado pelo Playwright
// ATENÇÃO: ajuste para o nome real do vídeo gerado!
const VIDEO_INPUT = fs.readdirSync('videos').filter(f => f.endsWith('.webm')).map(f => 'videos/' + f).sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime)[0];
if (!VIDEO_INPUT) {
  echo('Nenhum vídeo .webm encontrado em videos/.');
  process.exit(1);
}
echo('Usando vídeo: ' + VIDEO_INPUT);

// 3. Defina os blocos com tempos de início/fim e o áudio correspondente
// AJUSTE OS TEMPOS ABAIXO CONFORME SEU VÍDEO!
const BLOCOS = [
  { nome: '01_cadastro',      inicio: '00:00:00', fim: '00:00:07', audio: 'narration/01_cadastro.mp3' },
  { nome: '02_onboarding',    inicio: '00:00:07', fim: '00:00:15', audio: 'narration/02_onboarding.mp3' },
  { nome: '03_memorias',      inicio: '00:00:15', fim: '00:00:25', audio: 'narration/03_memorias.mp3' },
  { nome: '04_marcos',        inicio: '00:00:25', fim: '00:00:35', audio: 'narration/04_marcos.mp3' },
  { nome: '05_atividades',    inicio: '00:00:35', fim: '00:00:45', audio: 'narration/05_atividades.mp3' },
  { nome: '06_ia',            inicio: '00:00:45', fim: '00:00:55', audio: 'narration/06_ia.mp3' },
  { nome: '07_perfil',        inicio: '00:00:55', fim: '00:01:05', audio: 'narration/07_perfil.mp3' },
  { nome: '08_configuracoes', inicio: '00:01:05', fim: '00:01:15', audio: 'narration/08_configuracoes.mp3' },
  { nome: '09_loja',          inicio: '00:01:15', fim: '00:01:30', audio: 'narration/09_loja.mp3' }
];

// 4. Crie as pastas se não existirem
if (!fs.existsSync('final')) fs.mkdirSync('final');
if (!fs.existsSync('temp')) fs.mkdirSync('temp');

// 5. Função para cortar vídeo e sincronizar com áudio
function cortarESincronizar(bloco) {
  const videoCorte = `temp/${bloco.nome}.mp4`;
  const videoFinal = `final/${bloco.nome}_final.mp4`;
  // Corta o vídeo
  execSync(`ffmpeg -y -i ${VIDEO_INPUT} -ss ${bloco.inicio} -to ${bloco.fim} -c copy ${videoCorte}`);
  // Sincroniza com o áudio
  execSync(`ffmpeg -y -i ${videoCorte} -i ${bloco.audio} -c:v copy -c:a aac -shortest ${videoFinal}`);
  echo(`Bloco ${bloco.nome} pronto!`);
}

// 6. Processa todos os blocos
for (const bloco of BLOCOS) {
  cortarESincronizar(bloco);
}

// 7. Gera o arquivo de concatenação
const concatList = BLOCOS.map(b => `file '${b.nome}_final.mp4'`).join('\n');
fs.writeFileSync('final/lista.txt', concatList);

// 8. Junta todos os blocos finais
echo('Juntando todos os blocos finais...');
execSync(`ffmpeg -y -f concat -safe 0 -i final/lista.txt -c copy final/video_final.mp4`);
echo('Vídeo final gerado em final/video_final.mp4!');

function echo(msg) { console.log('\x1b[36m%s\x1b[0m', msg); } 