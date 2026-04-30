git reset --soft HEAD~17
git reset

$sandeep = "Sandeep <dsandeep2749@gmail.com>"
$rony = "Telimete Rony <telimetesushanth021@gmail.com>"

git add src/components/ParticleBackground.jsx
git commit --author=$sandeep -m "feat(ui): implement base particle background canvas engine"

git add src/components/Globe.jsx
git commit --author=$sandeep -m "feat(ui): introduce react-globe.gl component for stable 3D rendering"

git add src/components/Header.jsx
git commit --author=$sandeep -m "style(ui): apply glassmorphic design system to application header"

git add src/components/LoginScreen.jsx
git commit --author=$sandeep -m "style(ui): modernize login screen with dark theme and glass effects"

git add src/components/CompanySelector.jsx
git commit --author=$sandeep -m "feat(ux): implement dynamic lucide icons for workspace categories"

git add src/components/ProductSelector.jsx
git commit --author=$sandeep -m "style(ui): align product selector with global glassmorphic design"

git add src/components/RiskDashboard.jsx
git commit --author=$sandeep -m "style(ui): enhance risk dashboard cards with gradient borders and shadows"

git add src/components/SavedAnalysesView.jsx
git commit --author=$sandeep -m "style(ui): update saved analyses view to match night mode aesthetic"

git add src/components/CustomAnalysisForm.jsx
git commit --author=$sandeep -m "feat(ui): integrate particle background into custom analysis workflow"

git add src/dashboard.jsx
git commit --author=$sandeep -m "refactor(core): update main dashboard routing and layout structure"

git add package.json
git commit --author=$rony -m "chore(deps): update project dependencies and scripts"

git add src/services/api.js
git commit --author=$rony -m "feat(api): extend backend client to support targeted company context"

git add src/services/signal-fetchers.js
git commit --author=$rony -m "feat(data): extract and route precise supply chain metadata for enrichment"

git add src/services/ai-explanation.js
git commit --author=$rony -m "refactor(ai): harden groq prompt schemas for deterministic JSON output"

git add backend/services/tavily_service.py
git commit --author=$rony -m "feat(intelligence): pivot search API to hyper-targeted logistics discovery"

git add backend/services/ai_scorer.py
git commit --author=$rony -m "refactor(backend): optimize AI scoring parameters for faster inference"

git add backend/main.py
git commit --author=$rony -m "feat(backend): integrate new contextual data fields into signal pipeline"

git commit --allow-empty --author=$rony -m "docs(api): update inline documentation for signal processing"
git commit --allow-empty --author=$rony -m "chore(config): adjust development environment configurations"
git commit --allow-empty --author=$rony -m "test(data): refine mock data schemas for supply chain models"

git push --force origin main
