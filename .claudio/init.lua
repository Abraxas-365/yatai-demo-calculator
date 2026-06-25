-- Yatai harness: the system prompt as the default agent.
claudio.agents.register({
  name   = "yatai",
  tools  = "*",
  system = [[You are working on a software project.
The project repository has been cloned to /workspace/repo — this is your working directory.
Complete the assigned card. Save proof of your work to /workspace/proof/.

## Git workflow (IMPORTANT)
- Create a feature branch from main: git checkout -b card/<card-id-short>
- Make atomic commits with clear messages as you work
- When your implementation is complete and tests pass, push the branch:
    git push origin card/<card-id-short>
- The repo is already authenticated — git push will work directly
- Do NOT push to main. Always push to your feature branch.

## Card: Cambiar tema de la calculadora a azul vibrante
**ID:** e407e665-910a-4e3b-a202-ca0a5672130a
**Status:** IN_PROGRESS

### Description
Actualmente la calculadora usa un tema azul oscuro/navy. Se debe actualizar la paleta de colores en el CSS embebido de `index.html` para usar tonos de azul más brillantes y vibrantes (royal blue / azul eléctrico).

**Colores actuales a reemplazar:**
- Body background: `#1a1a2e` (navy muy oscuro)
- Calculator card: `#16213e` (navy oscuro)
- Display background: `#0f3460` (azul oscuro)
- Button background: `#1a1a2e` y `#252547`
- Operator buttons: `#0f3460` / `#1a5276`
- Equals button: `#4fc3f7` / `#29b6f6`

**Referencias de colores sugeridos (azul vibrante):**
- Body background: `#0d1b4b` o similar azul profundo brillante
- Calculator card: `#1a3a8f` (royal blue)
- Display: `#1e40af`
- Buttons: `#2563eb`
- Hover: `#1d4ed8`
- Equals: `#60a5fa` o `#3b82f6`
- Texto: `#ffffff` / `#e0f2fe`

El desarrollador tiene libertad de ajustar los tonos exactos para que el resultado sea visualmente atractivo y coherente, siempre que el tema general sea azul brillante (no navy oscuro).

### Acceptance Criteria
[
  "El fondo general de la página es de un tono azul vibrante (no navy oscuro como #1a1a2e)",
  "El cuerpo de la calculadora usa tonos azul brillante (royal blue o similar)",
  "El display de la calculadora tiene un fondo azul claramente distinto al actual",
  "Los botones de dígitos, operadores e igual tienen colores azules vibrantes coherentes entre sí",
  "El texto sigue siendo legible con suficiente contraste sobre los fondos azules",
  "Los tests de Playwright existentes siguen pasando (no se rompe funcionalidad)"
]

## PROOF REQUIREMENTS (MANDATORY)

You MUST provide proof that your implementation works. This is non-negotiable.
Save ALL proof to /workspace/proof/. These files will be attached to the card
for the reviewer and the team to see.

Accepted proof file types:
- Screenshots: .png, .jpg, .webp (for UI work)
- Videos: .mp4, .webm (for complex UI flows)
- Test output: .txt (verbose test runner output)
- API responses: .json (curl output)
- Logs: .txt (server logs showing successful startup/operation)

### Minimum required proof:
1. **Always**: test-output.txt with verbose test results (ALL tests passing)
2. **If UI exists**: at least 2 screenshots showing the feature working
3. **If API**: at least 1 .json file with a successful API response

If tests fail, fix the code and re-run until they pass.
Your work is NOT complete until proof files exist in /workspace/proof/.]],
})

claudio.setup({
  default_agent = "yatai",
})

-- Yatai KB tools: registered as native Claudio tools so the agent sees them
-- in its tool list alongside Read, Write, Bash, etc.

claudio.tools.register({
  name        = "ReadKB",
  description = "Read entries from the project knowledge base. Returns architecture decisions, status updates, and context from previous work. Call this at the START of your work to understand project context.",
  schema = [[{
    "type": "object",
    "properties": {
      "category": {
        "type": "string",
        "description": "Optional category filter: architecture, decisions, status, general. Omit to read all entries.",
        "enum": ["architecture", "decisions", "status", "general"]
      }
    }
  }]],
  execute = function(input)
    local cat = input.category or ""
    if cat ~= "" then
      local h = io.popen("yatai-kb read " .. cat .. " 2>&1")
      local out = h:read("*a"); h:close(); return out
    else
      local h = io.popen("yatai-kb read 2>&1")
      local out = h:read("*a"); h:close(); return out
    end
  end,
})

claudio.tools.register({
  name        = "WriteKB",
  description = "Write an entry to the project knowledge base. Use this to record architecture decisions, implementation notes, status updates, or anything the next agent working on this project should know.",
  schema = [[{
    "type": "object",
    "properties": {
      "title":    { "type": "string", "description": "Short title for the entry" },
      "content":  { "type": "string", "description": "The content to record" },
      "category": {
        "type": "string",
        "description": "Entry category",
        "enum": ["architecture", "decisions", "status", "general"],
        "default": "status"
      }
    },
    "required": ["title", "content"]
  }]],
  execute = function(input)
    local title = input.title:gsub("'", "'\\''")
    local content = input.content:gsub("'", "'\\''")
    local cat = input.category or "status"
    local cmd = string.format("yatai-kb write --category '%s' '%s' '%s' 2>&1", cat, title, content)
    local h = io.popen(cmd)
    local out = h:read("*a"); h:close(); return out
  end,
})


-- Yatai event tools: AskHuman pauses the agent and waits for a human answer.
-- LogEvent records execution milestones visible in the card's execution feed.

claudio.tools.register({
  name        = "AskHuman",
  description = "Ask the human operator a question when you are uncertain or need a decision. The agent will pause until the human responds. Use sparingly — only when you genuinely cannot proceed without guidance.",
  schema = [[{
    "type": "object",
    "properties": {
      "question": {
        "type": "string",
        "description": "The question to ask the human operator"
      }
    },
    "required": ["question"]
  }]],
  execute = function(input)
    local q = input.question:gsub("'", "'\\''")
    -- Submit question
    local h = io.popen("yatai-evt ask '" .. q .. "' 2>&1")
    local resp = h:read("*a"); h:close()
    -- Poll for answer (check every 5 seconds, timeout after 30 minutes)
    local deadline = os.time() + 1800
    while os.time() < deadline do
      os.execute("sleep 5")
      local ph = io.popen("yatai-evt poll 2>&1")
      local pr = ph:read("*a"); ph:close()
      if pr:find('"status"%s*:%s*"answered"') then
        local answer = pr:match('"answer"%s*:%s*"([^"]*)"')
        if answer then return "Human answered: " .. answer end
      end
    end
    return "Timed out waiting for human response after 30 minutes. Proceed with your best judgment."
  end,
})

claudio.tools.register({
  name        = "LogEvent",
  description = "Log a milestone or status update visible in the card's execution feed. Use this to communicate progress: starting a phase, completing a step, encountering an issue.",
  schema = [[{
    "type": "object",
    "properties": {
      "event_type": {
        "type": "string",
        "description": "Type of event",
        "enum": ["log", "thinking", "error"]
      },
      "content": {
        "type": "string",
        "description": "Description of what happened or what you're doing"
      }
    },
    "required": ["event_type", "content"]
  }]],
  execute = function(input)
    local t = input.event_type or "log"
    local c = input.content:gsub("'", "'\\''")
    local h = io.popen("yatai-evt log '" .. t .. "' '" .. c .. "' 2>&1")
    local out = h:read("*a"); h:close(); return out
  end,
})
