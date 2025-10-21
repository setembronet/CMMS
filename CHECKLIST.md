# Checklist de Implantação do Protótipo

Este documento detalha os passos necessários para transicionar o protótipo do TenantCare CMMS de dados estáticos para uma aplicação totalmente funcional com o Firebase Firestore, pronta para testes com dados reais.

## Fase 1: Migração Completa para o Firestore

O objetivo desta fase é substituir todos os dados mockados em `src/lib/data.ts` por coleções no Firestore, tornando a aplicação dinâmica.

-   [x] **Empresas**: Concluído.
-   [x] **Segmentos**: Concluído.
-   [x] **Funções (CMMS Roles)**: Concluído.
-   [x] **Clientes Finais (Locations)**: Concluído.
-   [x] **Usuários (CMMS)**: Concluído.
-   [x] **Ativos**: Concluído.
-   [x] **Contratos**: Concluído.
-   [x] **Peças (Products)**: Concluído.
-   [x] **Fornecedores**: Concluído.
-   [x] **Ordens de Serviço**: Concluído.
-   [x] **Finanças (Backoffice)**: Migrar todas as páginas financeiras (Contas a Pagar, Contas a Receber, Contas Bancárias) para suas respectivas coleções.

## Fase 2: Implementação de Regras de Segurança (Firestore Rules)

Atualmente, nossas regras são abertas para qualquer usuário autenticado. Precisamos restringir o acesso com base na função do usuário.

-   [ ] **Regra Base**: Modificar `firestore.rules` para negar acesso de leitura/escrita por padrão.
-   [ ] **Regras de Administrador (SaaS Admin)**: Criar uma função de `admin` que permita acesso total a todos os dados.
-   [ ] **Regras de Gestor (Cliente)**: Permitir que um usuário com a função `GESTOR` leia/escreva apenas documentos que correspondam ao seu `clientId`.
-   [ ] **Regras de Técnico**: Permitir que um `TECNICO` leia Ordens de Serviço e Ativos, mas só possa editar as OS que lhe foram atribuídas.
-   [ ] **Regras de Cliente Final (Síndico/Zelador)**: Implementar a regra mais restritiva, garantindo que um `SINDICO` só possa criar novas OS e ler/comentar nas OS relacionadas aos seus ativos.

## Fase 3: Autenticação de Usuários

Substituir o login mockado por um sistema de autenticação real.

-   [ ] **Implementar Firebase Auth**: Modificar a página de login (`/`) para usar o `signInWithEmailAndPassword` do Firebase Auth.
-   [ ] **Provedor de Usuário Dinâmico**: Ajustar o `ClientProvider` para obter o usuário logado a partir do `useAuth` do Firebase, em vez do `MOCKED_CURRENT_USER_ID`.
-   [ ] **Página de Logout**: Garantir que o botão "Sair" chame a função `signOut` do Firebase Auth.

## Fase 4: Script de Seed (Povoamento do Banco)

Para facilitar os testes, criaremos um script para popular o Firestore com os dados iniciais.

-   [ ] **Criar Script de Seed**: Desenvolver um script (Node.js) que leia o arquivo `data.ts` e use o Admin SDK do Firebase para inserir os dados iniciais nas coleções do Firestore. Isso garante um ambiente de teste consistente.

---

Com este checklist, temos um caminho claro para a finalização do nosso protótipo funcional. Nosso **próximo passo** será a **Fase 2: Implementação de Regras de Segurança (Firestore Rules)**.
