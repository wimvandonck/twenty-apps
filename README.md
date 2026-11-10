# twenty-apps

Monorepo for Twenty CRM apps. Each app lives in its own folder under `apps/` and is a standalone Twenty app project, with its own `package.json`, `yarn.lock` and `src/application-config.ts`. Apps are synced and deployed one at a time from their own folder.

# Layout

| Path | Contents |
| --- | --- |
| `apps/hello-world` | Minimal test app that adds a Greeting object |
| `.claude/skills` | Twenty's official agent skills: `create-app`, `develop-app`, `manage-app` |

# Working on an app

Install the Twenty CLI once:

```bash
npm install -g twenty@2.57.0
```

Authenticate against the workspace without prompts:

```bash
printf '%s' "$TWENTY_API_KEY" | twenty auth login --with-token --url "$TWENTY_URL" --name dev
```

Then, from the app folder:

```bash
yarn install
```

```bash
twenty app apply --create --remote dev
```

Use `twenty app apply` (without `--create`) for later syncs.

# Adding an app

From the repository root:

```bash
twenty app init <app-name> --path apps/<app-name>
```

`app init` writes a `.github/workflows` folder inside the app. GitHub only runs workflows from the repository root, so move or adapt them there if the app needs CI or CD.

# Agent skills

The skills in `.claude/skills` come from the `agent-skills` branch of [twentyhq/twenty](https://github.com/twentyhq/twenty/tree/agent-skills). To update them, copy `skills/create-app`, `skills/develop-app` and `skills/manage-app` from that branch over the folders here.
