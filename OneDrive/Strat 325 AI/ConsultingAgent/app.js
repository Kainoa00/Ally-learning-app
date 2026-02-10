/* ================================================
   CONSULTING AGENT — Core Application Logic
   Strategic Advisory + Slide Deck Builder
   ================================================ */

// ---- System Prompt (McKinsey-Level Consulting Agent) ----
const SYSTEM_PROMPT = `You are a Senior Management Consultant (Project Leader / Engagement Manager level) specializing in high-stakes strategic transformations. Your goal is to move the needle on ROIC (Return on Invested Capital) and Enterprise Value.

## CORE IDENTITY & MINDSET

### Analytical Rigor
- **2nd Order Effect Analysis**: Do not just identify a problem; identify the consequence of the consequence.
- **Zero-Based Thinking**: When evaluating costs or processes, assume nothing is "grandfathered in." Build recommendations from the ground up.
- **Benchmarking**: Always ask for or estimate industry benchmarks (e.g., "A typical SaaS company in this quadrant has a LTV/CAC ratio of 3x; yours is 1.8x").
- **The 80/20 Rule**: Focus proposals on the high-impact areas rather than an exhaustive list of minor issues.
- **Obligation to Dissent**: Challenge the user's assumptions if they are logically inconsistent or lack a clear path to value.
- **So-What? Filter**: Every sentence must pass the "So What?" test. If it doesn't lead to a decision or a deeper understanding of a lever, delete it.

### Communication Architecture — Level 3 Synthesis REQUIRED
- Level 1 (Description): "Revenue is down 10%." → AVOID
- Level 2 (Interpretation): "Revenue is down because of churn in the mid-market segment." → Better
- Level 3 (Synthesis/Action): "To offset the 10% revenue decline caused by mid-market churn, we must pivot sales resources to the Enterprise tier where retention is 95%." → YOUR STANDARD

### Structural Excellence
- **MECE Mastery**: All ideas must be Mutually Exclusive (no overlaps) and Collectively Exhaustive (no gaps).
- **Hypothesis-Driven Design**: Start with a "Day One" answer and use the proposal to prove or disprove it.
- **The Pyramid Principle**: Lead every section with the conclusion first. If the executive only reads the first sentence, they should know exactly what to do.

## SLIDE DECK & PROPOSAL STANDARDS

### Action-Oriented Headlines
- NEVER use descriptive titles like "Market Share Analysis"
- ALWAYS use assertive, action-oriented headlines like "Aggressive expansion in North America is required to offset 5% market share loss in Asia"
- Every headline should pass this test: "Does this headline tell the reader what to DO or CONCLUDE?"

### Horizontal & Vertical Logic
- **Horizontal Logic (Storyline)**: Reading ONLY the slide titles in sequence must tell a complete, logical story
- **Vertical Logic**: Every bullet point on a slide DIRECTLY supports that slide's specific headline. No tangents.

### Financial Lever Analysis
- Identify the "Critical Few" levers (Pricing, Variable Costs, Mix) that drive the majority of EBITDA impact
- Quantify impact wherever possible

### Visual Data Storytelling Recommendations
When recommending charts for slides, default to:
- **Waterfall Charts**: Show variance / bridge analysis (e.g., 2024 Profit → 2025 Profit)
- **Marimekko/Mekko Charts**: Visualize market size + market share simultaneously
- **2x2 Matrices**: Prioritization (Impact vs. Feasibility) and positioning
- **Harvey Balls**: Qualitative comparisons across multiple dimensions

## STRATEGIC FRAMEWORK TOOLBOX
Select the most appropriate framework:
- **SCQA** (Situation, Complication, Question, Answer): Mandatory for proposal introductions
- **Porter's Five Forces**: Industry attractiveness and competitive positioning
- **Three Horizons of Growth**: Balancing short-term performance with long-term innovation
- **Value Chain Analysis**: Identifying margin leakage in operations

## INTERACTION GUARDRAILS
1. **Force Prioritization**: If user gives 10 problems, force them to pick the "Critical Few." Say: "To ensure impact, we should focus on the two levers that drive 70% of the value."
2. **Data Skepticism**: Always ask about data quality. "Is this self-reported by the sales team, or pulled directly from the ERP?"
3. **The Elevator Test**: Can your recommendation be explained in 30 seconds to a CEO? If not, simplify.

## OUTPUT FORMAT
- Use markdown formatting for readability
- Use tables for comparisons and data
- Use bullet points structured in MECE format
- When generating slide content, use clear section markers
- Bold key metrics and action items`;

// ---- Slide Deck System Prompt ----
const SLIDE_DECK_PROMPT = `You are an expert slide deck architect producing McKinsey/BCG-caliber executive presentations. 

MANDATORY RULES FOR EVERY SLIDE:
1. **Action-Oriented Headlines ONLY**: Never "Market Overview." Instead: "Market is consolidating around 3 players, creating a $2B acquisition window in 2026."
2. **Pyramid Principle**: The headline IS the conclusion. Bullets prove it.
3. **Horizontal Logic**: When reading all slide titles in sequence, they must tell a complete story.
4. **Vertical Logic**: Every bullet on a slide directly supports THAT slide's headline. Zero tangents.
5. **MECE Structure**: Workstreams and sections must be mutually exclusive and collectively exhaustive.
6. **Level 3 Synthesis**: Every point must answer "So what?" and "Now what?"
7. **Quantify Everything**: Replace vague language with numbers. Not "significant growth" but "23% CAGR over 3 years."

SLIDE STRUCTURE FORMAT:
For each slide, output in this exact JSON format:
{
  "slides": [
    {
      "slideNumber": 1,
      "type": "title|executive_summary|analysis|recommendation|appendix",
      "headline": "Action-oriented headline (THIS IS THE CONCLUSION)",
      "subtitle": "Optional context line",
      "bullets": [
        "Each bullet PROVES the headline with data or logic",
        "Quantified wherever possible"
      ],
      "chartRecommendation": "Optional: waterfall|marimekko|2x2_matrix|bar|line|stacked_bar|none",
      "chartDescription": "Optional: What the chart should show",
      "speakerNotes": "What the presenter should SAY (not read) when presenting this slide"
    }
  ]
}

DECK STORYLINE STRUCTURE:
1. Title Slide: Client name + engagement title + date
2. Executive Summary: The "Day One Answer" — what you'd tell the CEO in 30 seconds
3. Situation: The undisputed facts (SCQA - S)
4. Complication: What has changed / what's at risk (SCQA - C)  
5. Key Question: The strategic question this raises (SCQA - Q)
6. Analysis slides (3-5): Each proving a piece of the hypothesis
7. Recommendation: The "Answer" with prioritized actions (SCQA - A)
8. Implementation Roadmap: Phased execution with owners and milestones
9. Financial Impact: Quantified value creation
10. Next Steps: Immediate actions with deadlines

Always output valid JSON. Do not include any text before or after the JSON.`;

// ---- Research System Prompt ----
const RESEARCH_PROMPT = `You are a Senior Research Analyst at a top-tier management consulting firm (McKinsey, BCG, Bain). Your job is to provide deep, data-driven research to support executive slide decks.

For the given slide topic, provide comprehensive research structured as follows:

1. **KEY DATA POINTS** (3-5 specific, quantified facts)
   - Include exact numbers, percentages, dollar amounts
   - Cite the source or basis (e.g., "Based on McKinsey Global Institute 2024 report")
   - Include year/timeframe for each data point

2. **INDUSTRY BENCHMARKS** (2-3 relevant comparisons)
   - Best-in-class performance metrics
   - Industry median/average
   - How this compares to the topic at hand

3. **CASE STUDIES** (1-2 relevant real-world examples)
   - Company name and context
   - What they did and the quantified outcome
   - The "So What" — why this matters for our analysis

4. **MARKET CONTEXT** (2-3 macro trends)
   - Market size and growth trajectory
   - Key regulatory or technology shifts
   - Competitive dynamics

5. **RISKS & COUNTER-ARGUMENTS** (2-3 considerations)
   - What could undermine this thesis?
   - What data would we need to validate assumptions?
   - Second-order effects to consider

6. **RECOMMENDED DATA VISUALIZATIONS**
   - What charts/graphs would best communicate these findings?
   - What axes, segments, or comparisons to highlight?

IMPORTANT RULES:
- Be SPECIFIC — no vague claims. Every statement should have a number or a concrete example.
- Use Level 3 Synthesis — don't just report data, explain what it MEANS for the decision.
- Flag data confidence levels: [HIGH] = well-established, [MEDIUM] = reasonable estimate, [LOW] = directional only.
- If you don't have exact current data, provide the best available estimate with a clearly stated basis.
- Format your response in clean Markdown with clear section headers.`;

// ---- State ----
let apiKey = localStorage.getItem('consulting_agent_api_key') || '';
let selectedModel = localStorage.getItem('consulting_agent_model') || 'gpt-4o';
let chatHistory = [];
let currentDeckSlides = [];
let slideResearch = {};  // Map of slideIndex -> research data
let isStreaming = false;

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
    if (apiKey) {
        document.getElementById('api-modal').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('model-badge').textContent = selectedModel.toUpperCase();
    }

    // Auto-resize textarea
    const textarea = document.getElementById('chat-input');
    if (textarea) {
        textarea.addEventListener('input', autoResize);
    }

    renderFrameworks();
    renderQuickPrompts();
});

function autoResize() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
}

// ---- API Key Management ----
function saveApiKey() {
    const keyInput = document.getElementById('api-key-input');
    const modelSelect = document.getElementById('model-select');
    const key = keyInput.value.trim();

    if (!key) {
        showToast('Please enter your API key', 'error');
        return;
    }

    apiKey = key;
    selectedModel = modelSelect.value;
    localStorage.setItem('consulting_agent_api_key', apiKey);
    localStorage.setItem('consulting_agent_model', selectedModel);

    document.getElementById('api-modal').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('model-badge').textContent = selectedModel.toUpperCase();
    showToast('Assistant connected successfully', 'success');
}

function openSettings() {
    document.getElementById('api-key-input').value = apiKey;
    document.getElementById('model-select').value = selectedModel;
    document.getElementById('api-modal').classList.remove('hidden');
}

// ---- Panel Navigation ----
function switchPanel(panelId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(`panel-${panelId}`).classList.add('active');
    document.querySelector(`[data-panel="${panelId}"]`).classList.add('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ---- Chat Functions ----
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message || isStreaming) return;

    // Add user message
    addMessage('user', message);
    input.value = '';
    input.style.height = 'auto';

    // Add to history
    chatHistory.push({ role: 'user', content: message });

    // Show typing indicator
    const typingEl = addTypingIndicator();

    isStreaming = true;
    document.getElementById('send-btn').disabled = true;

    try {
        const response = await callOpenAI(chatHistory);
        typingEl.remove();

        // Render assistant response
        addMessage('assistant', response);
        chatHistory.push({ role: 'assistant', content: response });
    } catch (error) {
        typingEl.remove();
        addMessage('assistant', `**Error:** ${error.message}\n\nPlease check your API key and try again.`);
    }

    isStreaming = false;
    document.getElementById('send-btn').disabled = false;
}

function addMessage(role, content) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${role}-message`;

    const avatarSvg = role === 'assistant'
        ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    div.innerHTML = `
        <div class="message-avatar">${avatarSvg}</div>
        <div class="message-content">
            <div class="message-role">${role === 'assistant' ? 'Consulting Agent' : 'You'}</div>
            <div class="message-text">${role === 'assistant' ? renderMarkdown(content) : escapeHtml(content)}</div>
        </div>
    `;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'message assistant-message';
    div.id = 'typing-msg';
    div.innerHTML = `
        <div class="message-avatar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
        </div>
        <div class="message-content">
            <div class="message-role">Consulting Agent</div>
            <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

function clearChat() {
    chatHistory = [];
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    // Re-add welcome message
    addMessage('assistant', `Good to connect. I'm your Senior Management Consultant, operating at the Project Leader / Engagement Manager level.

My focus is on **moving the needle on ROIC and Enterprise Value** through rigorous, hypothesis-driven strategic analysis.

Here's how I work:

- **MECE Structure** — All analysis is Mutually Exclusive, Collectively Exhaustive
- **Pyramid Principle** — Conclusions first, evidence below
- **Level 3 Synthesis** — Every recommendation has the "so what" and "now what"
- **Action-Oriented** — Slide headlines that tell you what to DO, not just what IS

What strategic challenge are we working on today?`);
}

// ---- OpenAI API ----
async function callOpenAI(messages, systemPrompt = SYSTEM_PROMPT) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: selectedModel,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 4096
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ---- Slide Deck Generation ----
async function generateDeck() {
    const topic = document.getElementById('deck-topic')?.value?.trim();
    const context = document.getElementById('deck-context')?.value?.trim();
    const audience = document.getElementById('deck-audience')?.value?.trim();
    const slideCount = document.getElementById('deck-slide-count')?.value || '10';
    const deckType = document.getElementById('deck-type')?.value || 'strategic_recommendation';

    if (!topic) {
        showToast('Please enter a proposal topic', 'error');
        return;
    }

    const genBtn = document.querySelector('#panel-deck .btn-primary');
    if (genBtn) {
        genBtn.disabled = true;
        genBtn.innerHTML = `<span class="typing-indicator" style="gap:3px"><span></span><span></span><span></span></span> <span>Building deck...</span>`;
    }

    const userPrompt = `Create a ${slideCount}-slide executive presentation deck.

DECK TYPE: ${deckType.replace(/_/g, ' ')}
TOPIC: ${topic}
${context ? `CONTEXT & DATA: ${context}` : ''}
${audience ? `TARGET AUDIENCE: ${audience}` : 'TARGET AUDIENCE: C-Suite executives'}

Requirements:
1. Follow the SCQA storyline structure
2. Every headline must be action-oriented (tells the reader what to DO or CONCLUDE)
3. Include chart recommendations for data-heavy slides
4. Include speaker notes for each slide
5. Quantify impact wherever possible
6. Structure must be MECE
7. Apply the Pyramid Principle throughout

Output the slides as a valid JSON object with the structure specified in your instructions.`;

    try {
        const response = await callOpenAI(
            [{ role: 'user', content: userPrompt }],
            SLIDE_DECK_PROMPT
        );

        // Parse JSON from response
        let slidesData;
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                slidesData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found');
            }
        } catch (parseErr) {
            // If JSON parse fails, try to create slides from markdown
            console.warn('JSON parse failed, attempting markdown parse:', parseErr);
            slidesData = parseSlidesFromMarkdown(response);
        }

        if (slidesData && slidesData.slides) {
            currentDeckSlides = slidesData.slides;
            renderSlidePreview(currentDeckSlides);
            showToast(`${currentDeckSlides.length}-slide deck generated successfully`, 'success');
        } else {
            throw new Error('Could not parse slide data from response');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        console.error('Deck generation error:', error);
    }

    if (genBtn) {
        genBtn.disabled = false;
        genBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>Generate Deck</span>`;
    }
}

function parseSlidesFromMarkdown(text) {
    // Fallback parser for non-JSON responses
    const slides = [];
    const sections = text.split(/(?=#{1,3}\s)/);

    sections.forEach((section, index) => {
        const lines = section.trim().split('\n').filter(l => l.trim());
        if (lines.length === 0) return;

        const headline = lines[0].replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '');
        const bullets = lines.slice(1)
            .filter(l => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().startsWith('*'))
            .map(l => l.replace(/^[\s\-•*]+/, '').replace(/\*\*/g, '').trim());

        if (headline) {
            slides.push({
                slideNumber: slides.length + 1,
                type: index === 0 ? 'title' : 'analysis',
                headline: headline,
                subtitle: '',
                bullets: bullets.length > 0 ? bullets : ['Content to be refined'],
                chartRecommendation: 'none',
                speakerNotes: ''
            });
        }
    });

    return { slides };
}

function renderSlidePreview(slides) {
    const container = document.getElementById('slide-preview-area');
    if (!container) return;

    container.innerHTML = '';

    slides.forEach((slide, index) => {
        const card = document.createElement('div');
        card.className = 'slide-card';
        card.id = `slide-${index}`;

        const typeLabel = (slide.type || 'analysis').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const chartBadge = slide.chartRecommendation && slide.chartRecommendation !== 'none'
            ? `<span class="slide-action-btn" style="cursor:default; background:rgba(34,211,238,0.1); color:var(--accent-cyan); border-color:rgba(34,211,238,0.2)">📊 ${slide.chartRecommendation.replace(/_/g, ' ')}</span>`
            : '';

        const bulletsHtml = (slide.bullets || []).map(b =>
            `<div class="bullet"><span class="bullet-marker"></span><span contenteditable="true">${escapeHtml(b)}</span></div>`
        ).join('');

        // Check if research already exists for this slide
        const hasResearch = slideResearch[index];
        const researchBtnLabel = hasResearch ? '📄 View Research' : '🔬 Research';
        const researchPanelHtml = hasResearch
            ? `<div class="research-panel" id="research-panel-${index}" style="display: none;">
                <div class="research-panel-header">
                    <span class="research-panel-title">🔬 Research Findings</span>
                    <div class="research-panel-actions">
                        <button class="slide-action-btn" onclick="researchSlide(${index})">🔄 Re-research</button>
                        <button class="slide-action-btn" onclick="applyResearchToSlide(${index})">📥 Apply to Slide</button>
                    </div>
                </div>
                <div class="research-content">${renderMarkdown(slideResearch[index])}</div>
              </div>`
            : `<div class="research-panel" id="research-panel-${index}" style="display: none;">
                <div class="research-loading">
                    <div class="research-loading-spinner"></div>
                    <span>Researching this topic...</span>
                </div>
              </div>`;

        card.innerHTML = `
            <div class="slide-card-header">
                <span class="slide-number">Slide ${slide.slideNumber || index + 1} — ${typeLabel}</span>
                <div class="slide-card-actions">
                    ${chartBadge}
                    <button class="slide-action-btn research-btn" onclick="toggleResearchPanel(${index})">${researchBtnLabel}</button>
                    <button class="slide-action-btn" onclick="editSlideWithAI(${index})">✨ Refine</button>
                    <button class="slide-action-btn" onclick="deleteSlide(${index})">✕</button>
                </div>
            </div>
            <div class="slide-preview">
                <div class="slide-title-bar" contenteditable="true">${escapeHtml(slide.headline)}</div>
                ${slide.subtitle ? `<div class="slide-subtitle-bar" contenteditable="true">${escapeHtml(slide.subtitle)}</div>` : ''}
                <div class="slide-body">${bulletsHtml}</div>
                <div class="slide-footer-bar">
                    <span>Confidential</span>
                    <span>Slide ${slide.slideNumber || index + 1}</span>
                </div>
            </div>
            ${slide.speakerNotes ? `
            <div style="padding: 12px 18px; border-top: 1px solid var(--border-subtle); font-size: 0.78rem; color: var(--text-tertiary);">
                <strong style="color: var(--text-secondary);">Speaker Notes:</strong> ${escapeHtml(slide.speakerNotes)}
            </div>` : ''}
            ${researchPanelHtml}
        `;

        container.appendChild(card);
    });

    // Add storyline check
    if (slides.length > 1) {
        const storylineCard = document.createElement('div');
        storylineCard.className = 'slide-card';
        storylineCard.style.borderColor = 'var(--accent-cyan)';
        storylineCard.innerHTML = `
            <div class="slide-card-header" style="background: rgba(34,211,238,0.08);">
                <span class="slide-number" style="color: var(--accent-cyan);">📐 Horizontal Logic Check — Storyline Flow</span>
            </div>
            <div style="padding: 18px;">
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 14px;">
                    Reading only the headlines below should tell a complete, logical story:
                </p>
                ${slides.map((s, i) => `
                    <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 8px;">
                        <span style="font-size: 0.72rem; font-weight: 700; color: var(--accent-primary); min-width: 18px;">${i + 1}.</span>
                        <span style="font-size: 0.85rem; color: var(--text-primary); line-height: 1.4;">${escapeHtml(s.headline)}</span>
                    </div>
                `).join('')}
                <button class="btn-secondary" style="margin-top: 14px;" onclick="checkStoryline()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    AI Storyline Review
                </button>
            </div>
        `;
        container.appendChild(storylineCard);
    }
}

async function editSlideWithAI(index) {
    const slide = currentDeckSlides[index];
    if (!slide) return;

    const refinement = prompt('How should this slide be refined? (e.g., "Make more quantitative", "Add competitive comparison", "Sharpen the so-what")');
    if (!refinement) return;

    showToast('Refining slide...', 'success');

    try {
        const response = await callOpenAI([{
            role: 'user',
            content: `Refine this single slide based on the feedback. Return ONLY a JSON object with the same slide structure.

CURRENT SLIDE:
${JSON.stringify(slide, null, 2)}

REFINEMENT REQUEST: ${refinement}

Remember: headline must be action-oriented, bullets must prove the headline, everything must pass the "So What?" test. Return valid JSON only.`
        }], SLIDE_DECK_PROMPT);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            let parsed = JSON.parse(jsonMatch[0]);
            // Handle if it returns {slides: [...]} or just a single slide
            const refinedSlide = parsed.slides ? parsed.slides[0] : parsed;
            refinedSlide.slideNumber = index + 1;
            currentDeckSlides[index] = refinedSlide;
            renderSlidePreview(currentDeckSlides);
            showToast('Slide refined successfully', 'success');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

function deleteSlide(index) {
    currentDeckSlides.splice(index, 1);
    currentDeckSlides.forEach((s, i) => s.slideNumber = i + 1);
    renderSlidePreview(currentDeckSlides);
    showToast('Slide removed', 'success');
}

async function checkStoryline() {
    const headlines = currentDeckSlides.map((s, i) => `${i + 1}. ${s.headline}`).join('\n');

    switchPanel('chat');

    const message = `Please evaluate the horizontal logic (storyline flow) of this slide deck. Read only the headlines and assess:

1. Does the storyline flow logically from one slide to the next?
2. Is there a clear SCQA arc (Situation → Complication → Question → Answer)?
3. Are there any logical gaps or redundancies?
4. Would a CEO grasp the full narrative just by reading these titles?

HEADLINES:
${headlines}

Provide specific improvements to any weak headlines, ensuring they remain action-oriented.`;

    document.getElementById('chat-input').value = message;
    await sendMessage();
}

// ---- Research Functions ----
async function researchSlide(index) {
    const slide = currentDeckSlides[index];
    if (!slide) return;

    // Show the research panel with loading state
    const panel = document.getElementById(`research-panel-${index}`);
    if (panel) {
        panel.style.display = 'block';
        panel.innerHTML = `
            <div class="research-loading">
                <div class="research-loading-spinner"></div>
                <span>Researching: "${escapeHtml(slide.headline.substring(0, 60))}${slide.headline.length > 60 ? '...' : ''}"</span>
            </div>
        `;
    }

    // Build context from the full deck for better research
    const deckContext = currentDeckSlides.map((s, i) =>
        `Slide ${i + 1}: ${s.headline}`
    ).join('\n');

    const researchPrompt = `Research the following slide topic in depth. This slide is part of a larger deck.

SLIDE TO RESEARCH:
- Headline: ${slide.headline}
- Type: ${slide.type || 'analysis'}
- Key Points: ${(slide.bullets || []).join('; ')}
${slide.subtitle ? `- Subtitle: ${slide.subtitle}` : ''}

FULL DECK CONTEXT (for reference):
${deckContext}

Provide comprehensive research following the structured format in your instructions. Be specific, quantitative, and actionable. Every data point should strengthen the slide's argument.`;

    try {
        const response = await callOpenAI(
            [{ role: 'user', content: researchPrompt }],
            RESEARCH_PROMPT
        );

        // Store the research
        slideResearch[index] = response;

        // Re-render to show results
        if (panel) {
            panel.innerHTML = `
                <div class="research-panel-header">
                    <span class="research-panel-title">🔬 Research Findings</span>
                    <div class="research-panel-actions">
                        <button class="slide-action-btn" onclick="researchSlide(${index})">🔄 Re-research</button>
                        <button class="slide-action-btn" onclick="applyResearchToSlide(${index})">📥 Apply to Slide</button>
                        <button class="slide-action-btn" onclick="copyResearch(${index})">📋 Copy</button>
                    </div>
                </div>
                <div class="research-content">${renderMarkdown(response)}</div>
            `;
        }

        // Update the button text
        const btn = document.querySelector(`#slide-${index} .research-btn`);
        if (btn) btn.textContent = '📄 View Research';

        showToast(`Research complete for Slide ${index + 1}`, 'success');
    } catch (error) {
        if (panel) {
            panel.innerHTML = `
                <div class="research-panel-header">
                    <span class="research-panel-title" style="color: var(--accent-rose);">⚠ Research Failed</span>
                </div>
                <div class="research-content" style="padding: 16px; color: var(--text-secondary);">
                    <p>${escapeHtml(error.message)}</p>
                    <button class="btn-secondary" style="margin-top: 12px;" onclick="researchSlide(${index})">Try Again</button>
                </div>
            `;
        }
        showToast(`Research error: ${error.message}`, 'error');
    }
}

async function researchAllSlides() {
    if (currentDeckSlides.length === 0) {
        showToast('No slides to research. Generate a deck first.', 'error');
        return;
    }

    const btn = document.getElementById('research-all-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="typing-indicator" style="gap:3px"><span></span><span></span><span></span></span> <span>Researching all slides...</span>`;
    }

    const total = currentDeckSlides.length;
    let completed = 0;

    for (let i = 0; i < currentDeckSlides.length; i++) {
        // Show panel for this slide
        const panel = document.getElementById(`research-panel-${i}`);
        if (panel) panel.style.display = 'block';

        await researchSlide(i);
        completed++;

        if (btn) {
            btn.innerHTML = `<span class="typing-indicator" style="gap:3px"><span></span><span></span><span></span></span> <span>Researching ${completed}/${total}...</span>`;
        }
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><span>Research All Slides</span>`;
    }

    showToast(`Research complete for all ${total} slides`, 'success');
}

function toggleResearchPanel(index) {
    const panel = document.getElementById(`research-panel-${index}`);
    if (!panel) return;

    const isVisible = panel.style.display !== 'none';

    if (isVisible) {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        // If no research exists yet, trigger research
        if (!slideResearch[index]) {
            researchSlide(index);
        }
    }
}

async function applyResearchToSlide(index) {
    const slide = currentDeckSlides[index];
    const research = slideResearch[index];
    if (!slide || !research) {
        showToast('No research available to apply', 'error');
        return;
    }

    showToast('Enhancing slide with research data...', 'success');

    try {
        const response = await callOpenAI([{
            role: 'user',
            content: `Enhance this slide using the research findings below. Update the headline and bullets to incorporate specific data points and benchmarks from the research. Return ONLY a JSON object with the same slide structure.

CURRENT SLIDE:
${JSON.stringify(slide, null, 2)}

RESEARCH FINDINGS:
${research}

Rules:
1. The headline must remain action-oriented but now include a specific data point
2. Replace vague bullets with quantified, research-backed statements
3. Add [Source] tags to key claims where the research provides sources
4. Keep the slide scannable — max 5 bullets
5. Maintain vertical logic — every bullet must prove the headline
6. Return valid JSON only.`
        }], SLIDE_DECK_PROMPT);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            let parsed = JSON.parse(jsonMatch[0]);
            const refinedSlide = parsed.slides ? parsed.slides[0] : parsed;
            refinedSlide.slideNumber = index + 1;
            currentDeckSlides[index] = refinedSlide;
            renderSlidePreview(currentDeckSlides);
            showToast('Slide enhanced with research data', 'success');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

function copyResearch(index) {
    const research = slideResearch[index];
    if (!research) {
        showToast('No research to copy', 'error');
        return;
    }
    navigator.clipboard.writeText(research).then(() => {
        showToast('Research copied to clipboard', 'success');
    });
}

function exportAllResearch() {
    if (Object.keys(slideResearch).length === 0) {
        showToast('No research to export. Research slides first.', 'error');
        return;
    }

    let md = `# Research Report\n\nGenerated: ${new Date().toLocaleDateString()}\n\n---\n\n`;

    currentDeckSlides.forEach((slide, index) => {
        md += `## Slide ${index + 1}: ${slide.headline}\n\n`;
        if (slideResearch[index]) {
            md += slideResearch[index] + '\n\n';
        } else {
            md += '_No research conducted for this slide._\n\n';
        }
        md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    downloadBlob(blob, 'deck_research_report.md');
    showToast('Research report exported', 'success');
}

// ---- Export Functions ----
function exportDeckJSON() {
    if (currentDeckSlides.length === 0) {
        showToast('No slides to export. Generate a deck first.', 'error');
        return;
    }

    const blob = new Blob([JSON.stringify({ slides: currentDeckSlides }, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'consulting_deck.json');
    showToast('JSON exported successfully', 'success');
}

function exportDeckMarkdown() {
    if (currentDeckSlides.length === 0) {
        showToast('No slides to export. Generate a deck first.', 'error');
        return;
    }

    let md = `# Executive Presentation\n\n---\n\n`;
    currentDeckSlides.forEach(slide => {
        md += `## Slide ${slide.slideNumber}: ${slide.headline}\n\n`;
        if (slide.subtitle) md += `*${slide.subtitle}*\n\n`;
        (slide.bullets || []).forEach(b => md += `- ${b}\n`);
        if (slide.chartRecommendation && slide.chartRecommendation !== 'none') {
            md += `\n📊 **Recommended Visual:** ${slide.chartRecommendation.replace(/_/g, ' ')}\n`;
            if (slide.chartDescription) md += `   ${slide.chartDescription}\n`;
        }
        if (slide.speakerNotes) md += `\n> **Speaker Notes:** ${slide.speakerNotes}\n`;
        md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    downloadBlob(blob, 'consulting_deck.md');
    showToast('Markdown exported successfully', 'success');
}

function exportDeckHTML() {
    if (currentDeckSlides.length === 0) {
        showToast('No slides to export. Generate a deck first.', 'error');
        return;
    }

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Executive Presentation</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f1f5f9; }
    .slide { width: 100%; max-width: 960px; margin: 40px auto; aspect-ratio: 16/9;
             background: linear-gradient(135deg, #0f172a, #1e293b); border: 1px solid rgba(148,163,184,0.1);
             border-radius: 12px; padding: 48px 56px; display: flex; flex-direction: column;
             position: relative; overflow: hidden; page-break-after: always; }
    .slide::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
                     background: linear-gradient(90deg, #6366f1, #22d3ee, #34d399); }
    .slide h2 { font-size: 1.6rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.02em; }
    .slide .subtitle { font-size: 0.85rem; color: #818cf8; font-weight: 500; text-transform: uppercase;
                       letter-spacing: 0.05em; margin-bottom: 24px; }
    .slide ul { list-style: none; flex: 1; display: flex; flex-direction: column; gap: 12px; }
    .slide li { display: flex; gap: 12px; align-items: flex-start; font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }
    .slide li::before { content: ''; width: 6px; height: 6px; min-width: 6px; background: #6366f1;
                        border-radius: 50%; margin-top: 8px; }
    .slide-footer { display: flex; justify-content: space-between; margin-top: auto; padding-top: 16px;
                    border-top: 1px solid rgba(148,163,184,0.08); font-size: 0.75rem; color: #475569; }
    .notes { max-width: 960px; margin: -20px auto 40px; padding: 16px 24px; background: #1e293b;
             border-radius: 0 0 12px 12px; font-size: 0.82rem; color: #64748b; border: 1px solid rgba(148,163,184,0.05); }
    @media print { .slide { break-after: page; box-shadow: none; margin: 0 auto; } .notes { break-before: avoid; } }
</style>
</head>
<body>
`;
    currentDeckSlides.forEach(slide => {
        html += `<div class="slide">
    <h2>${escapeHtml(slide.headline)}</h2>
    ${slide.subtitle ? `<div class="subtitle">${escapeHtml(slide.subtitle)}</div>` : ''}
    <ul>
        ${(slide.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('\n        ')}
    </ul>
    <div class="slide-footer">
        <span>Confidential</span>
        <span>Slide ${slide.slideNumber}</span>
    </div>
</div>
`;
        if (slide.speakerNotes) {
            html += `<div class="notes"><strong>Speaker Notes:</strong> ${escapeHtml(slide.speakerNotes)}</div>\n`;
        }
    });

    html += `</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, 'consulting_deck.html');
    showToast('HTML deck exported — open in browser and print to PDF', 'success');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ---- SCQA Builder ----
async function analyzeSCQA() {
    const s = document.getElementById('scqa-s').value.trim();
    const c = document.getElementById('scqa-c').value.trim();
    const q = document.getElementById('scqa-q').value.trim();
    const a = document.getElementById('scqa-a').value.trim();

    if (!s && !c && !q && !a) {
        showToast('Please fill in at least one SCQA field', 'error');
        return;
    }

    switchPanel('chat');

    const message = `I've structured an executive communication using SCQA. Please review it for:
1. Logical coherence — does C naturally follow from S? Does Q arise from C?
2. Level 3 Synthesis — is the Answer actionable, not just descriptive?
3. Elevator Test — could a CEO act on this in 30 seconds?
4. Missing elements — what data or evidence would strengthen each section?

**Situation:** ${s || '(not yet defined)'}

**Complication:** ${c || '(not yet defined)'}

**Question:** ${q || '(not yet defined)'}

**Answer:** ${a || '(not yet defined)'}

Provide specific improvements and a refined version.`;

    document.getElementById('chat-input').value = message;
    await sendMessage();
}

function copySCQA() {
    const s = document.getElementById('scqa-s').value.trim();
    const c = document.getElementById('scqa-c').value.trim();
    const q = document.getElementById('scqa-q').value.trim();
    const a = document.getElementById('scqa-a').value.trim();

    const text = `SITUATION:\n${s}\n\nCOMPLICATION:\n${c}\n\nQUESTION:\n${q}\n\nANSWER:\n${a}`;
    navigator.clipboard.writeText(text).then(() => {
        showToast('SCQA copied to clipboard', 'success');
    });
}

function clearSCQA() {
    ['scqa-s', 'scqa-c', 'scqa-q', 'scqa-a'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

// ---- Frameworks Library ----
const FRAMEWORKS = [
    {
        name: "Porter's Five Forces",
        icon: '🛡️',
        color: '#6366f1',
        tag: 'Competitive Strategy',
        description: 'Evaluate industry attractiveness by analyzing competitive intensity, supplier/buyer power, substitutes, and new entrants.',
        prompt: 'Apply Porter\'s Five Forces framework to analyze the competitive landscape. For each force, provide: (1) current intensity rating (Low/Medium/High), (2) the key driver, and (3) the strategic implication. End with a "So What?" synthesis on overall industry attractiveness and what this means for our positioning.'
    },
    {
        name: 'SCQA Framework',
        icon: '📐',
        color: '#22d3ee',
        tag: 'Communication',
        description: 'Structure executive communication: Situation (facts), Complication (tension), Question (what it raises), Answer (recommendation).',
        prompt: 'Structure this strategic challenge using SCQA (Situation, Complication, Question, Answer). The Situation should contain only undisputed facts. The Complication should create urgency. The Question should be specific and answerable. The Answer must be a Level 3 Synthesis — actionable, quantified, and passing the "Elevator Test."'
    },
    {
        name: 'Three Horizons of Growth',
        icon: '🌅',
        color: '#34d399',
        tag: 'Growth Strategy',
        description: 'Balance core business optimization (H1), emerging opportunities (H2), and long-term moonshots (H3).',
        prompt: 'Analyze the growth strategy using McKinsey\'s Three Horizons framework:\n- **H1 (Core):** What are the Critical Few levers to optimize the existing business in 0-12 months?\n- **H2 (Emerging):** What adjacent opportunities should we invest in over 12-36 months?\n- **H3 (Transformational):** What bold bets should we place for 36+ months?\nFor each horizon, quantify the expected EBITDA impact and identify the "killer risk."'
    },
    {
        name: 'Value Chain Analysis',
        icon: '🔗',
        color: '#fbbf24',
        tag: 'Operations',
        description: 'Identify exactly where margin leakage is occurring across the full value chain from procurement to customer delivery.',
        prompt: 'Perform a Value Chain Analysis to identify where margin is being leaked. For each stage (Inbound Logistics → Operations → Outbound → Marketing/Sales → Service), assess: (1) cost as % of revenue, (2) benchmark vs. best-in-class, (3) margin improvement opportunity in $M. Use Zero-Based Thinking — assume nothing is grandfathered in. Identify the "Critical Few" levers that drive 70% of the value.'
    },
    {
        name: '2x2 Prioritization Matrix',
        icon: '⚡',
        color: '#fb7185',
        tag: 'Decision Making',
        description: 'Map initiatives on Impact vs. Feasibility to identify quick wins, strategic bets, and deprioritization candidates.',
        prompt: 'Create a 2x2 prioritization matrix (Impact vs. Feasibility) for the strategic initiatives discussed. Classify each into: (1) Quick Wins (High Impact, High Feasibility — do NOW), (2) Strategic Bets (High Impact, Low Feasibility — invest and plan), (3) Fill-ins (Low Impact, High Feasibility — delegate), (4) Deprioritize (Low Impact, Low Feasibility — cut). Force-rank the top 3 and explain the 2nd-order effects of each.'
    },
    {
        name: 'Financial Lever Analysis',
        icon: '📊',
        color: '#a78bfa',
        tag: 'Value Creation',
        description: 'Decompose EBITDA into the Critical Few levers (pricing, volume, variable costs, fixed costs, mix) to find max impact.',
        prompt: 'Perform a Financial Lever Analysis. Decompose the P&L into key levers: Revenue (Price × Volume × Mix) and Costs (Variable vs. Fixed). For each lever, estimate: (1) a 1% improvement scenario in $M EBITDA impact, (2) feasibility, (3) implementation timeline. Use a Waterfall Chart approach to show the bridge from current to target EBITDA. Identify which 2-3 levers drive 70%+ of the total value creation opportunity.'
    },
    {
        name: 'Market Entry Assessment',
        icon: '🌐',
        color: '#2dd4bf',
        tag: 'Market Strategy',
        description: 'Structured MECE assessment of new market entry across regulatory, competitive, and unit economics dimensions.',
        prompt: 'Structure a market entry assessment into three MECE workstreams:\n1. **Regulatory Landscape**: Key barriers, licensing requirements, timeline to approval\n2. **Competitive Density**: Map of incumbents, their moats, and our differentiated value proposition\n3. **Unit Economics**: Expected CAC, LTV, payback period, and breakeven timeline\n\nProvide a Day-One hypothesis on whether to enter, and under what conditions. Apply the Elevator Test to your final recommendation.'
    },
    {
        name: 'M&A Strategic Rationale',
        icon: '🤝',
        color: '#f472b6',
        tag: 'Corporate Strategy',
        description: 'Evaluate acquisition targets on strategic fit, synergy potential, and value creation using a structured lens.',
        prompt: 'Evaluate this M&A opportunity across four dimensions:\n1. **Strategic Rationale**: Does it strengthen our core or open H2/H3 growth? Is this a "must-have" or "nice-to-have"?\n2. **Synergy Quantification**: Revenue synergies (cross-sell, new markets) + Cost synergies (SG&A, procurement). Estimate in $M with confidence level (High/Medium/Low).\n3. **Integration Risk**: Cultural fit, system compatibility, customer retention risk\n4. **Valuation Sanity Check**: Implied multiples vs. comparable transactions. Are we paying for hope or for cash flows?\n\nEnd with a PROCEED / PASS / CONDITIONAL recommendation.'
    }
];

function renderFrameworks() {
    const grid = document.getElementById('frameworks-grid');
    if (!grid) return;

    grid.innerHTML = FRAMEWORKS.map((fw, i) => `
        <div class="framework-card" style="--fw-color: ${fw.color}" onclick="useFramework(${i})">
            <div class="framework-icon" style="background: ${fw.color}15; color: ${fw.color}">
                ${fw.icon}
            </div>
            <h3>${fw.name}</h3>
            <p>${fw.description}</p>
            <span class="framework-tag" style="background: ${fw.color}15; color: ${fw.color}">${fw.tag}</span>
        </div>
    `).join('');
}

function useFramework(index) {
    const fw = FRAMEWORKS[index];
    switchPanel('chat');
    document.getElementById('chat-input').value = fw.prompt;
    document.getElementById('chat-input').focus();
    showToast(`${fw.name} loaded — customize and send`, 'success');
}

// ---- Quick Prompts ----
const QUICK_PROMPTS = [
    {
        icon: '📋',
        title: 'Client Proposal Structure',
        description: 'Generate a full consulting proposal outline with SCQA intro, workstreams, and pricing.',
        prompt: 'Create a structured consulting proposal outline for a strategic engagement. Include:\n\n1. **Cover Page** content (engagement title, confidentiality notice)\n2. **Executive Summary** using SCQA framework\n3. **Our Understanding of the Situation** (demonstrate empathy for client\'s challenge)\n4. **Proposed Approach** — 3-4 MECE workstreams, each with: objective, key activities, deliverables, timeline\n5. **Team & Qualifications** section structure\n6. **Investment & Timeline** — phased approach with milestones\n7. **Expected Impact** — quantified value creation estimates\n8. **Appendix** items to include\n\nMake every section header action-oriented. Apply the Pyramid Principle throughout.'
    },
    {
        icon: '🎯',
        title: 'Executive Summary Drafter',
        description: 'Draft a one-page executive summary that passes the 30-second elevator test.',
        prompt: 'Help me draft a one-page executive summary for a consulting engagement. I need:\n\n1. **The Day-One Answer** in one sentence\n2. **Three Supporting Pillars** — MECE evidence that proves the answer\n3. **Quantified Impact** — What\'s the $ value of acting on this?\n4. **Immediate Next Steps** — Three actions with owners and deadlines\n\nThe entire summary must pass the Elevator Test — a CEO should be able to act on it in 30 seconds. Use Level 3 Synthesis only. What topic or challenge should I write this for?'
    },
    {
        icon: '📊',
        title: 'Market Sizing (TAM/SAM/SOM)',
        description: 'Structure a bottom-up and top-down market sizing analysis.',
        prompt: 'Guide me through a rigorous market sizing analysis. I need both:\n\n**Top-Down Approach:**\n- Start with global market → apply filters to get addressable portion\n\n**Bottom-Up Approach:**\n- Start with unit economics × addressable customers\n\nFor each approach, tell me what data points I need, suggest proxy benchmarks where data isn\'t available, and help me triangulate to a defensible TAM/SAM/SOM. Apply data skepticism — flag where assumptions are weakest. What market are we sizing?'
    },
    {
        icon: '🔍',
        title: 'Due Diligence Checklist',
        description: 'Generate a comprehensive commercial due diligence framework.',
        prompt: 'Create a comprehensive commercial due diligence checklist structured in MECE workstreams:\n\n1. **Market Attractiveness** — size, growth, trends, cyclicality\n2. **Competitive Position** — share, differentiation, moats, switching costs\n3. **Customer Analysis** — concentration, retention, NPS, LTV/CAC\n4. **Revenue Quality** — recurring vs. one-time, pricing power, pipeline\n5. **Growth Upside** — organic levers, adjacencies, geographic expansion\n6. **Risk Factors** — regulatory, technology disruption, key-person dependency\n\nFor each area, provide: (a) the key question to answer, (b) data sources to request, (c) a red flag to watch for. What\'s the target company or industry?'
    },
    {
        icon: '💰',
        title: 'Pricing Strategy Workshop',
        description: 'Analyze pricing levers and their impact on profitability.',
        prompt: 'Structure a pricing strategy analysis using these dimensions:\n\n1. **Value-Based Pricing Assessment** — What is our product/service actually worth to the customer? How do we quantify willingness-to-pay?\n2. **Competitive Price Positioning** — Where do we sit vs. alternatives? Premium, parity, or penetration?\n3. **Price Architecture** — Bundling, tiering, good/better/best structuring\n4. **Elasticity Estimation** — How sensitive is volume to price changes?\n5. **Pricing Execution Gaps** — Discounting leakage, deal-level analysis, pocket price waterfall\n\n"A 1% price increase is typically the highest-leverage P&L move, flowing through at ~100% margin." Size the EBITDA impact of a 1-3% price increase for my business. What product/service are we pricing?'
    },
    {
        icon: '🏗️',
        title: 'Transformation Roadmap',
        description: 'Build a phased implementation plan with quick wins and strategic bets.',
        prompt: 'Help me build a 100-day transformation roadmap structured in three phases:\n\n**Phase 1: Quick Wins (Days 1-30)**\n- High-impact, high-feasibility actions to build momentum and credibility\n- Target: visible P&L impact within 30 days\n\n**Phase 2: Structural Changes (Days 31-70)**\n- Process redesign, organizational changes, system implementations\n- Target: foundations for sustainable improvement\n\n**Phase 3: Sustainable Scale (Days 71-100)**\n- Embed new operating model, metrics, and governance\n- Target: self-sustaining improvement without consultant dependency\n\nFor each phase, I need: (a) key initiatives, (b) owners, (c) KPIs, (d) risk mitigations. What transformation are we planning?'
    },
    {
        icon: '📈',
        title: 'Investor Narrative Builder',
        description: 'Craft a compelling investment thesis with quantified upside and risk analysis.',
        prompt: 'Help me build a compelling investor narrative. Structure it as:\n\n1. **The Thesis in One Sentence** — Why this is a "must-own" (Level 3)\n2. **Market Tailwind** — The macro trend making this investable NOW\n3. **Competitive Moat** — What stops others from copying?\n4. **Financial Proof Points** — Revenue growth, unit economics, margin trajectory\n5. **The Bull Case** — Quantified upside scenario with probability\n6. **The Bear Case** — What could go wrong, and our mitigation\n7. **The Ask** — Investment amount, use of proceeds, expected return\n\nApply the Pyramid Principle — lead with the conclusion. What company/opportunity are we building the narrative for?'
    },
    {
        icon: '🎓',
        title: 'Case Interview Practice',
        description: 'Practice a McKinsey-style case interview with structured feedback.',
        prompt: 'Let\'s do a case interview practice. You are the interviewer at McKinsey.\n\nGive me a case that tests:\n1. Structured problem decomposition (MECE)\n2. Quantitative reasoning (market sizing or profitability)\n3. Creative insight beyond the obvious\n4. Clear communication and synthesis\n\nPresent the case prompt, then wait for my response. After each response, evaluate me on:\n- **Structure** (1-5): Was the approach MECE?\n- **Insight** (1-5): Did I go beyond the obvious?\n- **Communication** (1-5): Was it clear and synthesized?\n- **Quantitative** (1-5): Were the numbers logical?\n\nGive specific coaching on how to improve. Let\'s begin.'
    }
];

function renderQuickPrompts() {
    const grid = document.getElementById('prompts-grid');
    if (!grid) return;

    grid.innerHTML = QUICK_PROMPTS.map((qp, i) => `
        <div class="prompt-card" onclick="useQuickPrompt(${i})">
            <div class="prompt-card-icon">${qp.icon}</div>
            <h4>${qp.title}</h4>
            <p>${qp.description}</p>
        </div>
    `).join('');
}

function useQuickPrompt(index) {
    const qp = QUICK_PROMPTS[index];
    switchPanel('chat');
    document.getElementById('chat-input').value = qp.prompt;
    document.getElementById('chat-input').focus();
    showToast(`${qp.title} loaded — customize and send`, 'success');
}

// ---- Markdown Renderer ----
function renderMarkdown(text) {
    if (!text) return '';

    let html = text
        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Headings
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Tables
        .replace(/^\|(.+)\|$/gm, (match) => {
            const cells = match.split('|').filter(c => c.trim());
            if (cells.every(c => c.trim().match(/^[-:]+$/))) return '<!--table-sep-->';
            return cells.map(c => `<td>${c.trim()}</td>`).join('');
        });

    // Build tables
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    let result = [];

    for (const line of lines) {
        if (line.includes('<td>') && !inTable) {
            inTable = true;
            tableHtml = '<table><thead><tr>' + line.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>') + '</tr></thead><tbody>';
        } else if (line === '<!--table-sep-->') {
            continue;
        } else if (line.includes('<td>') && inTable) {
            tableHtml += '<tr>' + line + '</tr>';
        } else if (inTable) {
            inTable = false;
            tableHtml += '</tbody></table>';
            result.push(tableHtml);
            result.push(line);
        } else {
            result.push(line);
        }
    }
    if (inTable) {
        tableHtml += '</tbody></table>';
        result.push(tableHtml);
    }

    html = result.join('\n');

    // Unordered lists
    html = html.replace(/^[\s]*[-•] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Cleanup
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[34]>)/g, '$1');
    html = html.replace(/(<\/h[34]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---- Toast Notifications ----
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        ${type === 'success' ? '✓' : '⚠'} ${message}
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---- Keyboard Shortcut ----
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K → Focus chat input
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        switchPanel('chat');
        document.getElementById('chat-input')?.focus();
    }
});
