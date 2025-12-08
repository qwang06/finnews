# FinNews

Finance news retrieval and AI-powered report generation application.

## Project Overview

This application retrieves finance news and information, then utilizes a finance-trained LLM model to generate detailed reports.

### Architecture

**Nx Monorepo** with clear separation:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Python FastAPI
- **Monorepo Tool**: Nx for task orchestration and caching

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- npm

### Setup

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Setup Python backend:**
   ```bash
   nx run api:setup
   ```
   This creates a virtual environment and installs all Python dependencies.

### Running the Application

1. **Start the backend API:**
   ```bash
   nx serve api
   ```
   API runs at `http://localhost:8725`

2. **Start the frontend** (in a new terminal):
   ```bash
   nx serve finnews
   ```
   Frontend runs at `http://localhost:5173`

3. **View API documentation:**
   Open `http://localhost:8725/docs`

## Project Structure

```
apps/
  ├── finnews/          # React frontend application
  │   ├── app/          # Application routes and components
  │   └── ...
  ├── finnews-e2e/      # E2E tests
  └── api/              # Python FastAPI backend
      ├── main.py       # FastAPI application
      ├── venv/         # Virtual environment (created on setup)
      └── ...
```

## Available Commands

### Frontend
- `nx serve finnews` - Start dev server
- `nx build finnews` - Production build
- `nx test finnews` - Run tests
- `nx lint finnews` - Lint code

### Backend
- `nx run api:setup` - Initial setup (create venv + install deps)
- `nx serve api` - Start API server
- `nx run api:install` - Install/update dependencies
- `nx run api:lint` - Lint Python code

### Workspace
- `npx nx graph` - View project dependency graph
- `npx nx show project <name>` - Show project details

## Development

See individual README files for more details:
- [Frontend README](apps/finnews/README.md)
- [Backend API README](apps/api/README.md)

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

---

## Nx Workspace Documentation

### Run tasks

To run the dev server for your app, use:

```sh
npx nx serve finnews
```

To create a production bundle:

```sh
npx nx build finnews
```

To see all available targets to run for a project, run:

```sh
npx nx show project finnews
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/react:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
