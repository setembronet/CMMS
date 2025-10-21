# Guia de Funcionalidades do Menu

Este documento detalha o propósito de cada seção e item de menu na barra de navegação da aplicação TenantCare CMMS.

## Estrutura do Menu

O menu é dividido em quatro seções principais, cada uma com um foco distinto:

1.  **Financeiro SaaS**: Gerenciamento do seu próprio negócio de SaaS.
2.  **Empresas**: Gerenciamento das empresas clientes que utilizam seu serviço.
3.  **CMMS**: Operação de manutenção para uma empresa cliente selecionada.
4.  **Configurações**: Configurações globais da sua plataforma SaaS.

---

### 1. Financeiro SaaS

Esta seção é dedicada à administração financeira e comercial do **seu negócio**, o TenantCare.

-   **Dashboard Financeiro**: Uma visão geral da saúde financeira do seu SaaS, mostrando métricas chave como Receita Recorrente Mensal (MRR), inadimplência e clientes ativos.
-   **Assinaturas**: Lista todas as assinaturas ativas de seus clientes, exibindo o plano e os add-ons contratados por cada um.
-   **Planos**: Permite criar e gerenciar os diferentes planos de assinatura que você oferece aos seus clientes (ex: Free, Pró, Enterprise), definindo preços e limites de uso.
-   **Add-ons**: Permite criar e gerenciar módulos ou funcionalidades extras que podem ser adicionados aos planos de assinatura, como "Módulo IA" ou "Módulo IoT".
-   **Backoffice (SaaS)**
    -   **Contas a Pagar**: Gerencia as despesas e contas a pagar da **sua própria empresa** (ex: aluguel do escritório, salários da equipe interna, marketing).

### 2. Empresas

Nesta seção, você gerencia as empresas que são suas clientes.

-   **Visão Geral**: Exibe uma lista de todas as empresas clientes cadastradas na sua plataforma, permitindo ver rapidamente o plano, o status (ativo/inativo) e os segmentos de atuação de cada uma.
-   **Segmentos**: Uma área poderosa para definir os diferentes tipos de equipamentos ou serviços que você gerencia (ex: Elevadores, Ar Condicionado, Escadas Rolantes). Aqui, você pode criar campos de dados personalizados para cada segmento.

### 3. CMMS (Computerized Maintenance Management System)

Esta é a seção operacional principal, onde o trabalho de manutenção é gerenciado para a **empresa cliente selecionada no menu superior**.

-   **Dashboard CMMS**: Fornece um painel operacional com os indicadores chave da empresa cliente selecionada, como ordens de serviço abertas, alertas urgentes e status dos ativos.
-   **Clientes**: Gerencia os **clientes finais** ou as **localizações** da sua empresa cliente (ex: os diferentes condomínios ou shoppings atendidos pela "Elevadores Atlas").
-   **Ativos**: Cadastro e gerenciamento de todos os equipamentos (elevadores, escadas rolantes, etc.) que pertencem aos clientes finais e para os quais você presta manutenção.
-   **Contratos**: Gerenciamento dos contratos de manutenção firmados com os clientes finais, incluindo detalhes de cobertura, valores e planos de manutenção preventiva.
-   **Ordens de Serviço**: O coração da operação. Aqui você cria, atribui, executa e finaliza todas as ordens de serviço, sejam elas corretivas ou preventivas.
-   **Usuários**: Gerencia os usuários (gestores, técnicos, síndicos) que pertencem à **empresa cliente selecionada**.
-   **Escala de Técnicos**: Permite criar e visualizar a escala de trabalho dos técnicos, incluindo turnos normais, plantões e folgas.
-   **Peças**: Cadastro e controle do inventário de peças e materiais utilizados nas manutenções.
-   **Fornecedores**: Gerenciamento dos fornecedores de peças, materiais ou serviços terceirizados.
-   **Sugestão de Compra**: Uma ferramenta inteligente que analisa o consumo histórico e o estoque atual para sugerir a compra de novas peças, otimizando o inventário.
-   **Ordens de Compra**: Criação e acompanhamento de ordens de compra para seus fornecedores.
-   **Backoffice (CMMS)**: Módulo financeiro específico para a operação da empresa cliente selecionada.
    -   **Dashboard Financeiro (CMMS)**: Visão financeira da operação do cliente, com fluxo de caixa, despesas e receitas.
    -   **Contas Bancárias**: Gerencia as contas bancárias da empresa cliente para controle de fluxo.
    -   **Plano de Contas**: Estrutura contábil que classifica todas as transações (receitas, custos, despesas).
    -   **Centros de Custo**: Agrupamento de despesas por departamento ou projeto (ex: Administrativo, Operacional).
    -   **Contas a Pagar (CMMS)**: Gerencia as despesas da empresa cliente.
    -   **Contas a Receber (CMMS)**: Gerencia as receitas e faturas a serem recebidas dos clientes finais.

### 4. Configurações

Esta área contém as configurações globais da sua plataforma.

-   **Geral**: Configurações de perfil do usuário administrador e aparência da plataforma (tema claro/escuro).
-   **Usuários do SaaS**: Gerencia os usuários internos da sua própria empresa (Admins, Financeiro, Suporte).
-   **Funções**: Permite criar e definir as diferentes funções que os usuários podem ter dentro do CMMS (ex: Gestor, Técnico, Síndico).
-   **Modelos de Checklist**: Criação de checklists padronizados para serem anexados às ordens de serviço, garantindo a qualidade e consistência dos procedimentos.
-   **Backup e Restore**: Ferramenta para exportar (backup) ou importar (restaurar) todos os dados da aplicação.
