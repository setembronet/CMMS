# **App Name**: TenantCare CMMS

## Core Features:

- Firebase Authentication: Implement Firebase Authentication for user login with email/password and role-based access control (Admin Master, Gestor de Empresa, Técnico).
- Multi-Tenancy Enforcement: Enforce multi-tenancy by filtering all Firestore reads and writes by the `client_id` to prevent cross-tenant data access. Firebase security rules will ensure data isolation.
- Master Dashboard: Develop a master dashboard for the Admin Master role, providing an overview of key SaaS KPIs such as active users, mock MRR, and active/inactive clients.
- Company Management: Enable the Admin Master to manage client companies with simple onboarding (Name, CNPJ, Email), status control (activate/deactivate), and assignment of `segmento_ativo` (e.g., 'ELEVADOR', 'ESCADA_ROLANTE') and `limite_ativos_contratados` (e.g., 5, 25, 50).
- Subscription Plan Management: Define subscription plans (Free, Pro) with asset limits. Free (5 assets), Pro (up to 25 assets)
- User and Role Management: Implement user management with role assignment (Gestor, Técnico) for each `client_id`, limited by the subscription plans. Include a `Equipe/Squad` field for Technicians.
- Data Structure Placeholders: Create basic Firestore data models for `/assets/{asset_id}`, `/ordens_servico/{os_id}`, and `/users/{user_id}` to prevent frontend errors: `client_id`, `segmento_ativo`, `numero_serie`, `localizacao`, `asset_id`, `status`, `prioridade`, `role`.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5), reflecting trust and reliability for business management.
- Background color: Light gray (#F0F2F5), providing a clean and professional backdrop.
- Accent color: Teal (#009688), for interactive elements, suggesting efficiency and action.
- Headline font: 'Space Grotesk', sans-serif, for a contemporary, technical feel, and 'Inter', sans-serif, for body text.
- Use clear and professional icons to represent various CMMS functions.
- Implement a responsive layout optimized for desktop and mobile devices.
- Incorporate subtle transitions and loading animations to enhance user experience.