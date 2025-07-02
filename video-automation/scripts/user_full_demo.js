const { chromium } = require('playwright');
const path = require('path');

const VIDEO_DIR = path.resolve(__dirname, '../videos/');
const EMAIL = 'maria'+Date.now()+'@teste.com';
const PASSWORD = 'SenhaForte123';

async function blocoCadastro(page) {
  console.log('=== INÍCIO BLOCO 01_CADASTRO ===');
  await page.goto('https://babydiary.shop/');
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await page.getByRole('textbox', { name: 'Nome completo' }).fill('Maria Influencer');
  await page.getByRole('textbox', { name: 'E-mail' }).fill(EMAIL);
  await page.getByRole('textbox', { name: 'Senha' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Criar conta grátis' }).click();
  await page.waitForTimeout(4000);
  console.log('=== FIM BLOCO 01_CADASTRO ===');
}

async function blocoOnboarding(page) {
  console.log('=== INÍCIO BLOCO 02_ONBOARDING ===');
  await page.getByRole('textbox', { name: 'Nome do bebê *' }).fill('Bebê Teste');
  await page.getByRole('textbox', { name: 'Data de nascimento *' }).fill('2025-06-30');
  await page.getByRole('button', { name: 'Menina' }).click();
  await page.getByRole('button', { name: 'Adicionar meu bebê' }).click();
  await page.waitForTimeout(3000);
  console.log('=== FIM BLOCO 02_ONBOARDING ===');
}

async function blocoMemorias(page) {
  console.log('=== INÍCIO BLOCO 03_MEMORIAS ===');
  await page.getByRole('button', { name: 'Memórias' }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Nova Memória' }).click();
  await page.getByRole('textbox', { name: 'Título' }).fill('Primeiro passo');
  await page.getByRole('textbox', { name: 'Descrição' }).fill('Começando a andar');
  await page.getByRole('button', { name: 'Salvar Memória' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.waitForTimeout(2000);
  console.log('=== FIM BLOCO 03_MEMORIAS ===');
}

async function blocoMarcos(page) {
  console.log('=== INÍCIO BLOCO 04_MARCOS ===');
  await page.getByRole('button', { name: 'Marcos' }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Novo Marco' }).click();
  await page.getByRole('textbox', { name: 'Título' }).fill('Primeiro sorriso');
  await page.getByLabel('Categoria').selectOption('social');
  await page.getByRole('textbox', { name: 'Descrição' }).fill('Muito alegre meu bebê');
  await page.getByRole('button', { name: 'Salvar Marco' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.waitForTimeout(2000);
  console.log('=== FIM BLOCO 04_MARCOS ===');
}

async function blocoAtividades(page) {
  console.log('=== INÍCIO BLOCO 05_ATIVIDADES ===');
  await page.getByRole('button', { name: 'Atividades' }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Nova Atividade' }).click();
  await page.getByRole('combobox', { name: 'Tipo' }).click();
  await page.getByRole('option', { name: 'Sono' }).click();
  await page.getByRole('textbox', { name: 'Título' }).fill('Sono');
  await page.getByRole('textbox', { name: 'Descrição' }).fill('Sono');
  await page.getByRole('textbox', { name: 'Data e Hora' }).fill('2025-07-01T12:50');
  await page.getByRole('spinbutton', { name: 'Duração (minutos)' }).fill('60');
  await page.getByRole('textbox', { name: 'Notas adicionais' }).fill('Sono');
  await page.getByRole('button', { name: 'Salvar Atividade' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.waitForTimeout(2000);
  console.log('=== FIM BLOCO 05_ATIVIDADES ===');
}

async function blocoIA(page) {
  console.log('=== INÍCIO BLOCO 06_IA ===');
  await page.getByRole('button', { name: 'Assistente' }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('textbox', { name: 'Digite sua pergunta...' }).fill('Meu bebê está com febre');
  await page.getByRole('textbox', { name: 'Digite sua pergunta...' }).press('Enter');
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.waitForTimeout(2000);
  console.log('=== FIM BLOCO 06_IA ===');
}

async function blocoPerfil(page) {
  console.log('=== INÍCIO BLOCO 07_PERFIL ===');
  await page.getByRole('button', { name: 'Perfil' }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Editar Perfil' }).click();
  await page.getByRole('textbox', { name: 'Nome completo *' }).fill('Maria Influencer Editada');
  await page.getByRole('button', { name: 'Salvar Alterações' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.waitForTimeout(2000);
  console.log('=== FIM BLOCO 07_PERFIL ===');
}

async function blocoConfiguracoes(page) {
  console.log('=== INÍCIO BLOCO 08_CONFIGURACOES ===');
  await page.getByRole('button', { name: 'Configurações' }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Editar Perfil' }).click();
  await page.getByRole('textbox', { name: 'Nome completo *' }).fill('Maria Nova');
  await page.getByRole('button', { name: 'Salvar Alterações' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.waitForTimeout(2000);
  console.log('=== FIM BLOCO 08_CONFIGURACOES ===');
}

async function blocoLoja(page) {
  console.log('=== INÍCIO BLOCO 09_LOJA ===');
  await page.getByRole('button', { name: 'Acessar Loja' }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('button', { name: 'Ver carrinho' }).click();
  await page.getByRole('button', { name: 'Finalizar Compra' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.waitForTimeout(2000);
  console.log('=== FIM BLOCO 09_LOJA ===');
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } }
  });
  const page = await context.newPage();

  await blocoCadastro(page);
  await blocoOnboarding(page);
  await blocoMemorias(page);
  await blocoMarcos(page);
  await blocoAtividades(page);
  await blocoIA(page);
  await blocoPerfil(page);
  await blocoConfiguracoes(page);
  await blocoLoja(page);

  await page.waitForTimeout(3000);
  await page.close();
  await context.close();
  await browser.close();

  console.log('Fluxo completo gravado!');
})();