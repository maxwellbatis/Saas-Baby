# Política de Segurança

## Versões Suportadas

Use esta seção para informar às pessoas sobre quais versões do seu projeto estão atualmente sendo suportadas com atualizações de segurança.

| Versão | Suportada          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reportando uma Vulnerabilidade

Se você descobriu uma vulnerabilidade de segurança, por favor, **NÃO** abra uma issue pública. Em vez disso, envie um email para [security@babydiary.shop](mailto:security@babydiary.shop).

### O que incluir no relatório

- Descrição detalhada da vulnerabilidade
- Passos para reproduzir o problema
- Possível impacto da vulnerabilidade
- Sugestões de correção (se houver)

### Processo de Resposta

1. **Confirmação**: Você receberá uma confirmação em 48 horas
2. **Investigação**: Nossa equipe investigará a vulnerabilidade
3. **Correção**: Desenvolveremos uma correção
4. **Disclosure**: Coordenaremos a divulgação pública
5. **Atualização**: Lançaremos a correção

### Timeline

- **48 horas**: Confirmação inicial
- **7 dias**: Status da investigação
- **30 dias**: Correção planejada
- **90 dias**: Divulgação pública (se não corrigida)

## Práticas de Segurança

### Para Desenvolvedores

- Execute `npm audit` regularmente
- Mantenha dependências atualizadas
- Use HTTPS em produção
- Valide todas as entradas do usuário
- Implemente rate limiting
- Use variáveis de ambiente para secrets

### Para Usuários

- Mantenha o aplicativo atualizado
- Use senhas fortes
- Ative autenticação de dois fatores
- Monitore atividades suspeitas
- Reporte comportamentos estranhos

## Histórico de Vulnerabilidades

### 2024-01-15 - CVE-2024-001
- **Descrição**: Vulnerabilidade XSS em campo de comentários
- **Severidade**: Média
- **Status**: Corrigida
- **Versão**: 1.0.1

## Contato

- **Email**: security@babydiary.shop
- **PGP Key**: [0x1234567890ABCDEF](https://keys.openpgp.org/vks/v1/by-fingerprint/1234567890ABCDEF)
- **Responsável**: Equipe de Segurança do Baby Diary

## Agradecimentos

Agradecemos a todos os pesquisadores de segurança que ajudam a manter o Baby Diary seguro para nossos usuários. 