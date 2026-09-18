# Registro de Decisões (DACI)

Toda decisão de trade-off final é do **Head** (sessão principal). Subagentes
recomendam; o Head decide e registra aqui.

Formato de cada entrada: **data · dono · decisão · trade-off sacrificado**.

| Data | Dono | Decisão | Trade-off sacrificado |
|------|------|---------|-----------------------|
| 2026-09-18 | Head | **Stack de backend/hosting: Firebase** (Auth, Firestore, Storage, Cloud Functions, Firebase Cloud Messaging), recomendada por `backend-integration` para viabilizar admin de conteúdo (Prática da Semana + upload PDF/JPG/PNG/áudio em Orações/Músicas/Textos) e push nativo iOS/Android com o menor esforço de infraestrutura própria. Ver `docs/BACKEND-ARCHITECTURE.md`. | Portabilidade/lock-in no ecossistema Google e modelagem relacional verdadeira (perdidas frente a Supabase/backend custom), em troca de velocidade de entrega do MVP e suporte nativo unificado a push (FCM cobre APNs e Android) |
| 2026-09-16 | Head | **Ativar estrutura completa (18 papéis)** a pedido explícito do usuário, com perfis de senioridade verbatim; apagados os 6 subagentes fundidos do Estágio Enxuto e refeitos como especialistas individuais. Head permanece como sessão principal (não subagente). | Menor custo de coordenação do Estágio Enxuto — trocado por granularidade 1-para-1 com o organograma |
| _(anterior)_ 2026-09-16 | Head | Estrutura em Estágio Enxuto (6 papéis fundidos) — **substituída** | Granularidade de 18 papéis, em troca de menor custo de coordenação |

<!-- Adicione novas decisões acima desta linha, a mais recente no topo. -->
