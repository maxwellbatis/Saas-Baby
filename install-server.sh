#!/bin/bash

# Script de instalação para servidor Linux
set -e

echo "🚀 Instalando Baby Diary no servidor..."

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root (sudo)"
    exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências
echo "🔧 Instalando dependências..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Docker
echo "🐳 Instalando Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
usermod -aG docker $SUDO_USER

# Instalar Docker Compose
echo "📋 Instalando Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Nginx (para proxy reverso)
echo "🌐 Instalando Nginx..."
apt install -y nginx

# Instalar Certbot
echo "🔒 Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Criar diretório do projeto
echo "📁 Criando diretório do projeto..."
mkdir -p /opt/babydiary
cd /opt/babydiary

# Clonar repositório (ajuste a URL)
echo "📥 Clonando repositório..."
git clone https://github.com/seu-usuario/babydiary.git .

# Configurar permissões
chown -R $SUDO_USER:$SUDO_USER /opt/babydiary

# Criar arquivo .env
echo "⚙️ Configurando variáveis de ambiente..."
if [ ! -f .env ]; then
    cp env.production.example .env
    echo "📝 Edite o arquivo .env com suas configurações"
fi

# Configurar Nginx
echo "🌐 Configurando Nginx..."
cp nginx-production.conf /etc/nginx/sites-available/babydiary
ln -sf /etc/nginx/sites-available/babydiary /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Configurar SSL
echo "🔒 Configurando SSL..."
echo "📝 Certifique-se de que os domínios apontam para este servidor antes de continuar"
read -p "Pressione Enter para continuar..."

certbot --nginx -d babydiary.shop -d www.babydiary.shop -d api.babydiary.shop -d admin.babydiary.shop --non-interactive --agree-tos --email seu-email@exemplo.com

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
docker-compose up -d

# Executar migrations
echo "🗄️ Executando migrations..."
docker-compose exec -T backend npx prisma migrate deploy

# Executar seed
echo "🌱 Executando seed..."
docker-compose exec -T backend npx prisma db seed

# Configurar monitoramento
echo "📊 Configurando monitoramento..."
cat > /etc/systemd/system/babydiary-monitor.service << EOF
[Unit]
Description=Baby Diary Monitor
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/babydiary
ExecStart=/usr/bin/docker-compose ps
Restart=always
RestartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable babydiary-monitor

echo "✅ Instalação concluída!"
echo ""
echo "🌐 URLs:"
echo "  Frontend: https://babydiary.shop"
echo "  API: https://api.babydiary.shop"
echo "  Admin: https://admin.babydiary.shop"
echo ""
echo "📋 Comandos úteis:"
echo "  Status: cd /opt/babydiary && docker-compose ps"
echo "  Logs: cd /opt/babydiary && docker-compose logs -f"
echo "  Restart: cd /opt/babydiary && docker-compose restart"
echo "  Update: cd /opt/babydiary && git pull && docker-compose up -d --build"
echo ""
echo "🔒 SSL será renovado automaticamente"
echo "📊 Monitoramento ativo" 