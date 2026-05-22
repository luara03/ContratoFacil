# EventoPro Manager

Aplicativo web responsivo para gestão profissional de eventos com foco em empresas organizadoras e profissionais autônomos.

## Funcionalidades implementadas

- Sidebar fixa com acesso aos módulos principais.
- Dashboard com cards de resumo (eventos, faturamento, tarefas atrasadas e estoque em alerta).
- Cadastro base para 14 módulos de negócio (clientes, eventos, espaços, fornecedores, estoque, checklists, logística, cronograma, equipe, financeiro, contratos, relatórios, notificações e configurações).
- Persistência local via `localStorage`.
- Pesquisa global para encontrar módulos rapidamente.
- Tema claro/escuro.
- Registro simples de auditoria por inclusão.
- Exportação de dados por módulo em JSON.

## Como executar

Abra o `index.html` no navegador.

Opcional com servidor local:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.
