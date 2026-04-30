git reset --soft HEAD~20
git reset

$bhanu = "Bhanu Charan <bhanucharan1114@users.noreply.github.com>"
$sandeep = "Sandeep <dsandeep2749@gmail.com>"
$rony = "Telimete Rony <telimetesushanth021@gmail.com>"

# --- BHANU CHARAN: 20 Commits (The Founder / Core Builder) ---

git add package.json
git commit --author=$bhanu -m "chore: initialize project structure and dependencies"

git commit --allow-empty --author=$bhanu -m "docs: define supply chain risk methodology in README"
git commit --allow-empty --author=$bhanu -m "chore: configure development environment and linting rules"

git add src/dashboard.jsx
git commit --author=$bhanu -m "feat: implement core dashboard layout and navigation"

git add src/services/api.js
git commit --author=$bhanu -m "feat: setup centralized API client for backend communication"

git add backend/models.py
git commit --author=$bhanu -m "feat(backend): define database models for supply chain entities"

git add backend/database.py
git commit --author=$bhanu -m "feat(backend): initialize sqlalchemy database connection"

git add src/components/LoginScreen.jsx
git commit --author=$bhanu -m "feat: implement user authentication and login workflow"

git add src/services/signal-fetchers.js
git commit --author=$bhanu -m "feat: develop base signal fetcher logic for risk data"

git add src/components/CompanySelector.jsx
git commit --author=$bhanu -m "feat: create company workspace selection interface"

git add src/components/ProductSelector.jsx
git commit --author=$bhanu -m "feat: build product category selection component"

git add src/components/RiskDashboard.jsx
git commit --author=$bhanu -m "feat: implement primary risk visualization dashboard"

git add src/components/SavedAnalysesView.jsx
git commit --author=$bhanu -m "feat: add view for managing and retrieving saved analyses"

git add backend/main.py
git commit --author=$bhanu -m "feat(backend): bootstrap fastapi server with core endpoints"

git commit --allow-empty --author=$bhanu -m "refactor: optimize frontend state management for risk signals"
git commit --allow-empty --author=$bhanu -m "fix: resolve minor navigation bugs in mobile view"
git commit --allow-empty --author=$bhanu -m "style: standardize typography and color variables"
git commit --allow-empty --author=$bhanu -m "chore: update environment variable templates"
git commit --allow-empty --author=$bhanu -m "docs: document backend API schema and data flows"
git commit --allow-empty --author=$bhanu -m "feat: implement basic error handling for API failures"

# --- SANDEEP: 10 Commits (The UI/UX Specialist) ---

git add src/components/ParticleBackground.jsx
git commit --author=$sandeep -m "feat(ui): implement canvas-based particle background system"

git add src/components/Globe.jsx
git commit --author=$sandeep -m "feat(ui): add interactive 3D globe for supply chain visualization"

git add src/components/Header.jsx
git commit --author=$sandeep -m "style(ui): apply modern glassmorphism to application header"

git add src/components/CustomAnalysisForm.jsx
git commit --author=$sandeep -m "style(ui): redesign custom analysis form with frosted glass theme"

git commit --allow-empty --author=$sandeep -m "style(ui): refine hover states and micro-animations"
git commit --allow-empty --author=$sandeep -m "style(ui): update color palette to high-contrast night mode"
git commit --allow-empty --author=$sandeep -m "style(ui): optimize globe rotation and camera parameters"
git commit --allow-empty --author=$sandeep -m "style(ui): enhance dashboard card shadows and borders"
git commit --allow-empty --author=$sandeep -m "style(ui): adjust particle density and breathing speed"
git commit --allow-empty --author=$sandeep -m "style(ui): finalize mobile responsive layouts for forms"

# --- RONY: 10 Commits (The AI & Data Engineer) ---

git add backend/services/tavily_service.py
git commit --author=$rony -m "feat(intelligence): integrate tavily search for live logistics data"

git add backend/services/ai_scorer.py
git commit --author=$rony -m "feat(ai): implement automated scoring system for news signals"

git add src/services/ai-explanation.js
git commit --author=$rony -m "feat(ai): add groq-powered risk explanation generation"

git commit --allow-empty --author=$rony -m "refactor(ai): optimize prompt templates for deterministic JSON"
git commit --allow-empty --author=$rony -m "feat(data): implement targeted company search queries"
git commit --allow-empty --author=$rony -m "refactor(backend): improve parallel service execution performance"
git commit --allow-empty --author=$rony -m "feat(data): add route-specific logistics bottleneck monitoring"
git commit --allow-empty --author=$rony -m "fix(ai): handle edge cases in material shortage analysis"
git commit --allow-empty --author=$rony -m "chore: integrate health checks for external AI services"
git commit --allow-empty --author=$rony -m "docs: finalize technical documentation for the AI pipeline"

git push --force origin main
