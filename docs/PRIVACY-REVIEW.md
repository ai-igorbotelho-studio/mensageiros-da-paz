# Parecer de Segurança & Privacidade — Device Token FCM (Push)

Documento produzido pelo subagente `security-privacy`, a pedido do Head, em
resposta à pendência sinalizada por `backend-integration` em
`docs/BACKEND-ARCHITECTURE.md` (seção 5 — Notificações push): "o uso do
device token deve ser consultado com security-privacy antes de produção,
com decisão final do Head".

> **Este é um parecer técnico de privacidade, não aconselhamento jurídico.**
> Validação jurídica formal (suficiência do texto de consentimento, da
> política de privacidade e conformidade LGPD/GDPR completa) é
> responsabilidade do Head/cliente junto a um profissional do direito antes
> do lançamento.

**Veredito: aprovação COM RESSALVAS.** A arquitetura de push descrita em
`docs/BACKEND-ARCHITECTURE.md` está tecnicamente correta, mas não deve ir a
produção sem os ajustes da seção 3 abaixo.

---

## 1. Classificação do dado

O device token FCM deve ser tratado como **dado pessoal** sob a LGPD (art.
5º, I) — é um identificador de dispositivo vinculável a uma pessoa, mesmo
sem conter PII direta (nome, e-mail, etc.). Metadados associados (idioma do
dispositivo, plataforma iOS/Android) são aceitáveis para o funcionamento do
recurso, mas **nada além disso** deve ser coletado para a feature de
notificações.

## 2. Base legal

**Consentimento explícito** (LGPD art. 7º, I) — coerente com o desenho já
proposto de notificações como *feature opt-in*, nunca habilitada por padrão.

## 3. Ajustes obrigatórios antes do gate de produção

a. **Toggle "ativar notificações" desativado por padrão**, com texto
   simples explicando o que é enviado e como desativar (voice & tone da
   direção criativa: gentil, sem jargão).

b. **Exclusão explícita do token ao desativar o toggle.** O desenho atual
   do backend só remove tokens reativamente (erro `NotRegistered` do FCM).
   Isso é insuficiente: o usuário pode desligar o toggle e manter o app
   instalado sem que o token seja removido. É necessária uma rota explícita
   (`DELETE /devices/{token}` ou equivalente) chamada pelo app no momento em
   que o usuário desativa a permissão.

c. **Job periódico de limpeza de tokens obsoletos.** O campo `last_seen_at`
   já existe no modelo de dados, mas não há rotina agendada que o utilize.
   Adicionar uma Cloud Function agendada (ex. Cloud Scheduler) que remove
   tokens sem atividade recente.

d. **Validação server-side estrita do payload `POST /devices`** —
   schema restrito a `{ token, platform }` apenas, com rate limiting via
   Cloud Function, antes de abrir a regra pública `allow create, update:
   true` no Firestore tal como descrita hoje em `docs/BACKEND-ARCHITECTURE.md`.

e. **Política de Privacidade do app.** Não existe hoje no repositório.
   É obrigatória tanto pela LGPD quanto pelas lojas de aplicativo. Precisa
   cobrir: dado coletado, finalidade, base legal, prazo de retenção e como
   o usuário revoga o consentimento.

f. **Declarações nas lojas de aplicativo.** Apple App Store *Privacy
   Nutrition Label* e Google Play *Data Safety form*, ambos declarando a
   coleta de identificador de dispositivo para fins de notificação.

## 4. Minimização de dados

Confirmada como adequada no desenho atual: nenhuma coleta de nome, e-mail
ou localização para a feature de push. **Manter assim** — qualquer proposta
futura de coletar mais dados para push deve passar por nova revisão deste
agente.

## 5. Retenção e exclusão

- Token removido automaticamente quando o FCM reporta `NotRegistered`
  (desinstalação) — já previsto no backend.
- Token removido explicitamente quando o usuário desativa o toggle
  (ajuste 3b, ainda pendente).
- Token removido por inatividade prolongada via job periódico (ajuste 3c,
  ainda pendente).

## 6. Checklist de conformidade antes de produção

- [ ] Toggle de notificações desativado por padrão (app)
- [ ] Texto de consentimento simples e claro no toggle (app, `content-seo`)
- [ ] Rota de exclusão explícita de token ao desativar (backend + app)
- [ ] Job agendado de limpeza de tokens obsoletos (backend)
- [ ] Validação server-side estrita do payload de registro de device
      (backend)
- [ ] Política de Privacidade do app publicada (Head/jurídico)
- [ ] Apple App Store Privacy Nutrition Label preenchido
- [ ] Google Play Data Safety form preenchido
- [ ] Validação jurídica formal da conformidade LGPD (Head, fora do escopo
      deste time técnico)

---

## Próximos passos

1. **Head** registra esta decisão em `DECISIONS.md` (matriz DACI de uso de
   dado pessoal).
2. **`backend-integration`** implementa os ajustes 3b–3d.
3. **`content-seo`** escreve o texto de consentimento do toggle.
4. **`mobile-crossplatform` / `ux-architect`** desenham a tela de
   configurações onde o toggle deve viver (lacuna já sinalizada por
   `mobile-crossplatform` — não estava mapeada em `docs/UX-ARCHITECTURE.md`).
5. **Head** providencia Política de Privacidade e declarações de loja antes
   do gate de deploy.
