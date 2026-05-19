/**
 * PhiloMind - Interactive Learning Engine
 * Built for premium aesthetics and immersive user experiences.
 */

// Global State
let state = {
    activeTab: 'dashboard',
    theme: 'light',
    streak: 12,
    completedNodes: ['absurdism'],
    activeConcept: 'freedom', // 'absurdism', 'facticity', 'freedom', 'gaze'
    flashcards: [
        {
            id: 1,
            tag: 'Existentialism',
            question: "What is Sartre's 'Facticity'?",
            answer: "In existentialism, facticity refers to the objective facts of a person's life that they cannot change, such as their birth, physical characteristics, environment, and past choices. It is the 'given' context within which human freedom must operate, representing the resistance of reality against absolute freedom."
        },
        {
            id: 2,
            tag: 'Absurdism',
            question: "According to Camus, how should one respond to 'The Absurd'?",
            answer: "Camus rejects both physical suicide and intellectual suicide (religion/dogma). Instead, he advocates for revolt: accepting the absurdity of life while continuing to live with passion, rebellion, and freedom, much like Sisyphus pushing his boulder eternally."
        },
        {
            id: 3,
            tag: 'Existentialism',
            question: "What does the phrase 'Existence precedes essence' mean?",
            answer: "Coined by Jean-Paul Sartre, it means that humans are not born with a predefined purpose, nature, or soul (essence). Instead, we exist first, and then we must define who we are, our values, and our meaning through our active choices and actions."
        },
        {
            id: 4,
            tag: 'Existentialism',
            question: "What is Sartre's concept of 'Bad Faith' (Mauvaise Foi)?",
            answer: "Bad faith is the self-deception where individuals convince themselves that they do not possess the freedom to choose, adopting social roles or value systems to escape the anguish of absolute personal responsibility."
        },
        {
            id: 5,
            tag: 'Nietzschean',
            question: "What is 'Amor Fati' and who popularized it?",
            answer: "Popularized by Friedrich Nietzsche, Amor Fati translates to 'love of fate.' It is the philosophical attitude of embracing everything that happens in life—including suffering and loss—as good, or at least necessary, rather than wishing for it to be different."
        }
    ],
    cardIndex: 0,
    cardMastery: {}, // cardId -> rating (1-4)
    podcast: {
        isPlaying: false,
        currentTime: 0,
        duration: 45, // seconds for simulation
        intervalId: null,
        ep: "Episode 4",
        title: "Condemned to be Free: The Burden of Choice",
        transcript: [
            { time: 0, speaker: "Host", text: "Welcome back to PhiloMind Podcasts. Today, we're diving into Sartre's most famous paradox." },
            { time: 5, speaker: "Host", text: "When Sartre says we are 'condemned to be free,' it sounds rather heavy, almost like a prison sentence. What does he mean?" },
            { time: 13, speaker: "Guest", text: "Indeed, it is a heavy concept. The condemnation is simply the inescapable fact of it: you cannot choose not to choose." },
            { time: 21, speaker: "Guest", text: "Even if you decide to remain silent, to withdraw, or to let someone else decide for you, that itself is an active choice you made." },
            { time: 30, speaker: "Host", text: "So there is absolutely no cosmic escape from responsibility? No moral safety nets?" },
            { time: 37, speaker: "Guest", text: "None whatsoever. There are no external values to blame. We are entirely the authors of our own destiny." }
        ]
    },
    conceptsData: {
        absurdism: {
            title: "Absurdism",
            author: "Camus",
            difficulty: "Medium",
            time: "8 min read",
            quickTake: '"Quick Take: The Absurd is born of this confrontation between the human need and the unreasonable silence of the world."',
            fullText: "Albert Camus argued that human beings have an innate desire for meaning, order, and purpose in life. However, the universe is cold, silent, and fundamentally devoid of any objective meaning. The clash between our search for meaning and the silent universe is 'The Absurd'. Camus asserts that instead of escaping through religion or despair, we must embrace this tension and live with passionate defiance.",
            box1Title: "Human Desire",
            box1Desc: "The perpetual search for order, ultimate truth, and structural purpose.",
            connectorText: "Confronts",
            box2Title: "Silent Universe",
            box2Desc: "The chaotic, meaningless reality that offers no answers or cosmic validation.",
            podcastEp: "Episode 2",
            podcastTitle: "Revolting Against the Void: Camus and Sisyphus",
            debatePrompt: "Camus claims we must imagine Sisyphus happy, defying absurdity through physical effort. But is this active defiance truly satisfying, or is it just a coping mechanism to avoid facing absolute pointlessness? Can an arbitrary meaning ever suffice?"
        },
        facticity: {
            title: "Facticity",
            author: "Sartre",
            difficulty: "Medium",
            time: "10 min read",
            quickTake: '"Quick Take: We are our context, but we are also the ways we choose to project out of it."',
            fullText: "In Sartre's existential ontology, facticity represents the rigid, objective facts of our past and physical limits. It includes your birth year, your height, your genetics, and choices you have already committed. Facticity is the canvas. While we cannot change the canvas, our 'Transcendence' defines how we paint over it. We are free to choose our attitude toward our facticity.",
            box1Title: "Facticity (Given)",
            box1Desc: "Unchangeable details: your past, body, birthplace, and committed actions.",
            connectorText: "Canvas for",
            box2Title: "Transcendence (Projected)",
            box2Desc: "Your future possibilities, intentions, and absolute freedom to choose your stance.",
            podcastEp: "Episode 3",
            podcastTitle: "Sartre's Double Aspect: Being-in-itself vs For-itself",
            debatePrompt: "If our birthplace, biological makeup, and historical circumstances (Facticity) heavily dictate our choices, opportunities, and psychological biases, how can Sartre claim human freedom is absolute? Isn't our freedom bounded rather than radical?"
        },
        freedom: {
            title: "Radical Freedom",
            author: "Sartre",
            difficulty: "Hard",
            time: "12 min read",
            quickTake: '"Quick Take: Existence precedes essence. We are condemned to be free."',
            fullText: "Sartre argues that human beings simply exist first, and then we define ourselves through our choices and actions. There is no predetermined human nature, no divine plan, and no excuses. This absolute freedom brings profound anguish, as we are entirely responsible for who we become.",
            box1Title: "Being-in-itself",
            box1Desc: "Objects. Facticity. Complete, full, unchangeable identity.",
            connectorText: "Negation",
            box2Title: "Being-for-itself",
            box2Desc: "Consciousness. Nothingness. Fluid, undefinable, absolute freedom.",
            podcastEp: "Episode 4",
            podcastTitle: "Condemned to be Free: The Burden of Choice",
            debatePrompt: "Sartre asserts that freedom is absolute and we are responsible for everything we are. But if freedom is absolute, are we responsible for things inherently beyond our control, like our birthplace, our physical limitations, or natural disasters? How does Existentialism address these seemingly immovable constraints?"
        },
        gaze: {
            title: "The Gaze",
            author: "Sartre",
            difficulty: "Hard",
            time: "15 min read",
            quickTake: '"Quick Take: Hell is other people (L\'enfer, c\'est les autres)."',
            fullText: "The Gaze (Le Regard) is Sartre's concept of how other conscious beings perceive us. When another person looks at us, we suddenly become aware of ourselves as an object in *their* world. This restricts our absolute freedom because we are now defined by their judgments, turning us from a free 'subject' into a solid, frozen 'object'.",
            box1Title: "Subjectivity",
            box1Desc: "My own fluid consciousness where I am the center of the world.",
            connectorText: "Frozen by",
            box2Title: "Objectification",
            box2Desc: "Being perceived by Another, turning me into a fixed entity in their mind.",
            podcastEp: "Episode 5",
            podcastTitle: "The Look: Under the Surveillance of the Other",
            debatePrompt: "Sartre claims that the Gaze of the Other is conflict-ridden because it objectifies us. But can the Gaze not also be a source of love, recognition, and shared meaning? Must relations with others always be a battle for subjective dominance?"
        }
    }
};

// Heatmap generator (21 days: 3 weeks)
function generateHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const activityPatterns = [
        0, 1, 0, 2, 3, 0, 4, // Week 1
        2, 0, 1, 3, 4, 0, 2, // Week 2
        0, 1, 2, 3, 4, 4, 4  // Week 3 (Streak ending today)
    ];

    activityPatterns.forEach((val, idx) => {
        const cell = document.createElement('div');
        cell.className = 'w-full aspect-square rounded-sm transition-all duration-200 cursor-pointer';
        
        if (val === 0) cell.classList.add('bg-surface-container', 'dark:bg-slate-800', 'hover:bg-slate-300', 'dark:hover:bg-slate-700');
        else if (val === 1) cell.classList.add('bg-secondary/20', 'hover:bg-secondary/30');
        else if (val === 2) cell.classList.add('bg-secondary/50', 'hover:bg-secondary/60');
        else if (val === 3) cell.classList.add('bg-secondary/75', 'hover:bg-secondary/85');
        else if (val === 4) cell.classList.add('bg-secondary/100', 'border', 'border-secondary', 'hover:opacity-90');
        
        if (idx === activityPatterns.length - 1) {
            cell.className += ' ring-2 ring-accent-purple ring-offset-2 ring-offset-background';
            cell.title = 'Today: 4 Reflections (Streak Protected)';
        } else {
            cell.title = `Reflection Day ${idx + 1}: ${val} contributions`;
        }

        cell.addEventListener('click', () => {
            showNotification(`You logged ${val} deep study sessions on this date!`);
        });

        grid.appendChild(cell);
    });
}

// Draggable Mindmap Logic
let journeyMap = {
    scale: 1,
    panX: -350,
    panY: -275,
    isDragging: false,
    startX: 0,
    startY: 0
};

function initMindmap() {
    const container = document.getElementById('canvas-container');
    const viewport = document.getElementById('journey-viewport');
    if (!container || !viewport) return;

    // Draggable canvas events
    const startDrag = (e) => {
        journeyMap.isDragging = true;
        viewport.classList.remove('cursor-grab');
        viewport.classList.add('cursor-grabbing');
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        journeyMap.startX = clientX - journeyMap.panX;
        journeyMap.startY = clientY - journeyMap.panY;
    };

    const drag = (e) => {
        if (!journeyMap.isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        journeyMap.panX = clientX - journeyMap.startX;
        journeyMap.panY = clientY - journeyMap.startY;
        
        journeyMap.panX = Math.max(-900, Math.min(100, journeyMap.panX));
        journeyMap.panY = Math.max(-800, Math.min(100, journeyMap.panY));
        
        updateCanvasTransform();
    };

    const stopDrag = () => {
        journeyMap.isDragging = false;
        viewport.classList.remove('cursor-grabbing');
        viewport.classList.add('cursor-grab');
    };

    // Remove duplicates
    viewport.replaceWith(viewport.cloneNode(true));
    const newViewport = document.getElementById('journey-viewport');

    newViewport.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDrag);

    newViewport.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', stopDrag);

    newViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 0.05 : -0.05;
        zoomCanvas(zoomFactor);
    }, { passive: false });

    updateCanvasTransform();
}

function zoomCanvas(amount) {
    journeyMap.scale = Math.max(0.6, Math.min(1.6, journeyMap.scale + amount));
    updateCanvasTransform();
}

function resetCanvas() {
    journeyMap.scale = 1.0;
    journeyMap.panX = -350;
    journeyMap.panY = -275;
    updateCanvasTransform();
    showNotification("Map canvas centered and reset to 100%.");
}

function updateCanvasTransform() {
    const container = document.getElementById('canvas-container');
    if (container) {
        container.style.transform = `translate(${journeyMap.panX}px, ${journeyMap.panY}px) scale(${journeyMap.scale})`;
    }
}

// Flashcard Spaced Repetition Logic
function initFlashcards() {
    const flashcard = document.getElementById('flashcard');
    if (!flashcard) return;

    const cloned = flashcard.cloneNode(true);
    flashcard.parentNode.replaceChild(cloned, flashcard);

    cloned.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        cloned.classList.toggle('is-flipped');
    });

    renderCurrentCard();
}

function renderCurrentCard() {
    const current = state.flashcards[state.cardIndex];
    
    document.getElementById('card-tag').innerText = current.tag;
    document.getElementById('card-question').innerText = current.question;
    document.getElementById('card-answer-q').innerText = current.question;
    document.getElementById('card-answer').innerHTML = current.answer;
    
    document.getElementById('flashcard-progress-text').innerText = `${state.cardIndex + 1} of ${state.flashcards.length} Cards`;
    const percent = Math.round((state.cardIndex / state.flashcards.length) * 100);
    document.getElementById('flashcard-progress-bar').style.width = `${percent || 5}%`;
    
    const ratedCount = Object.keys(state.cardMastery).length;
    let scoreTotal = 0;
    Object.values(state.cardMastery).forEach(v => scoreTotal += v);
    const avgScore = ratedCount > 0 ? Math.round((scoreTotal / (ratedCount * 4)) * 100) : 0;
    document.getElementById('mastery-percent').innerText = `Score: ${avgScore}%`;

    const nextIdx = (state.cardIndex + 1) % state.flashcards.length;
    document.getElementById('flashcard-next-q').innerText = `"${state.flashcards[nextIdx].question}"`;
}

function rateCard(rating) {
    const current = state.flashcards[state.cardIndex];
    state.cardMastery[current.id] = rating;
    
    const flashcard = document.getElementById('flashcard');
    if (!flashcard) return;
    
    flashcard.classList.remove('is-flipped');
    flashcard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    flashcard.style.transform = 'translateX(-120px) rotateY(0deg) scale(0.9)';
    flashcard.style.opacity = '0';
    
    setTimeout(() => {
        state.cardIndex++;
        if (state.cardIndex >= state.flashcards.length) {
            state.cardIndex = 0;
            showNotification("Spaced Repetition session complete! Streaks updated.");
            state.streak++;
            document.getElementById('streak-count').innerText = state.streak;
            saveStateToStorage();
        }
        
        renderCurrentCard();
        flashcard.style.transform = 'translateX(120px) rotateY(0deg) scale(0.9)';
        
        setTimeout(() => {
            flashcard.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s';
            flashcard.style.transform = 'translateX(0) rotateY(0deg) scale(1)';
            flashcard.style.opacity = '1';
            saveStateToStorage();
        }, 50);
    }, 300);
}

// Concept Learning Detail Loader
function loadConcept(conceptKey) {
    const concept = state.conceptsData[conceptKey];
    if (!concept) return;

    state.activeConcept = conceptKey;

    document.getElementById('sidebar-category-title').innerText = concept.title;
    
    const sidebarList = document.getElementById('sidebar-node-list');
    if (sidebarList) {
        sidebarList.innerHTML = '';
        
        const modules = [
            { key: 'absurdism', title: 'The Absurd', mod: 'Module 1', icon: 'check', class: 'bg-node-complete text-white' },
            { key: 'facticity', title: 'Facticity', mod: 'Module 2', icon: 'play_arrow', class: 'bg-secondary-container text-white node-breathing' },
            { key: 'freedom', title: 'Radical Freedom', mod: 'Module 3', icon: 'lock_open', class: 'border-2 border-secondary text-secondary bg-surface' },
            { key: 'gaze', title: 'The Gaze', mod: 'Module 4', icon: 'lock', class: 'border-2 border-slate-300 dark:border-slate-700 text-slate-400' }
        ];

        modules.forEach(m => {
            const isActive = m.key === conceptKey;
            const item = document.createElement('li');
            item.className = `flex items-start gap-4 cursor-pointer transition-all duration-300 ${isActive ? 'scale-105 opacity-100' : 'opacity-70 hover:opacity-100'}`;
            item.onclick = () => loadConcept(m.key);

            item.innerHTML = `
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ring-4 ring-background ${m.class}">
                    <span class="material-symbols-outlined text-[16px]">${m.icon}</span>
                </div>
                <div>
                    <p class="text-[10px] font-bold ${isActive ? 'text-secondary dark:text-indigo-300' : 'text-on-surface-variant dark:text-outline-variant'}">${isActive ? 'Current Study Focus' : m.mod}</p>
                    <p class="font-bold text-sm text-primary dark:text-white">${m.title}</p>
                </div>
            `;
            sidebarList.appendChild(item);
        });
    }

    document.getElementById('concept-difficulty').innerText = `Difficulty: ${concept.difficulty}`;
    document.getElementById('concept-time').innerText = concept.time;
    document.getElementById('concept-headline-title').innerHTML = `Concept: ${concept.title} <span class="text-secondary dark:text-indigo-300">(${concept.author})</span>`;
    document.getElementById('concept-quick-take').innerText = concept.quickTake;
    document.getElementById('concept-full-text').innerText = concept.fullText;
    
    document.getElementById('framework-box-1-title').innerText = concept.box1Title;
    document.getElementById('framework-box-1-desc').innerText = concept.box1Desc;
    document.getElementById('framework-connector-text').innerText = concept.connectorText;
    document.getElementById('framework-box-2-title').innerText = concept.box2Title;
    document.getElementById('framework-box-2-desc').innerText = concept.box2Desc;

    // Reset debate chatbox
    const chatbox = document.getElementById('debate-chat-box');
    if (chatbox) {
        chatbox.innerHTML = `
            <div class="flex items-start gap-4 max-w-3xl">
                <div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <span class="material-symbols-outlined text-lg">smart_toy</span>
                </div>
                <div class="bg-surface-container dark:bg-slate-700/60 rounded-2xl rounded-tl-none p-5 text-on-surface dark:text-slate-100 text-sm leading-relaxed" id="initial-ai-debate-prompt">
                    ${concept.debatePrompt}
                </div>
            </div>
        `;
    }

    // Suggested Pills reloading
    const pills = document.getElementById('suggested-prompt-pills');
    if (pills) {
        if (conceptKey === 'absurdism') {
            pills.innerHTML = `
                <button onclick="triggerDebatePill('Explain the myth of Sisyphus')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Explain Sisyphus</button>
                <button onclick="triggerDebatePill('What is philosophical suicide?')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">What is philosophical suicide?</button>
                <button onclick="triggerDebatePill('Give me a modern example of absurd defiance')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Defiance example</button>
            `;
        } else if (conceptKey === 'facticity') {
            pills.innerHTML = `
                <button onclick="triggerDebatePill('Can biological limits limit freedom?')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Biological limits</button>
                <button onclick="triggerDebatePill('Give an example of bad faith vs facticity')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Bad faith vs Facticity</button>
                <button onclick="triggerDebatePill('How does past choice define our context?')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Past choice context</button>
            `;
        } else if (conceptKey === 'gaze') {
            pills.innerHTML = `
                <button onclick="triggerDebatePill('Why is Hell other people?')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Why Hell is other people?</button>
                <button onclick="triggerDebatePill('Is love possible in Sartre\'s views?')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Is love possible?</button>
                <button onclick="triggerDebatePill('Explain the Keyhole example')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Keyhole example</button>
            `;
        } else {
            pills.innerHTML = `
                <button onclick="triggerDebatePill('Explain &quot;Facticity&quot;')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Explain "Facticity"</button>
                <button onclick="triggerDebatePill('Provide a Real-life example')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Provide a Real-life example</button>
                <button onclick="triggerDebatePill('Formulate a Counter-argument')" class="bg-surface-container-low dark:bg-slate-800 hover:bg-secondary/15 dark:hover:bg-secondary/15 text-secondary dark:text-indigo-300 border border-secondary/25 rounded-full px-4 py-2 text-xs font-bold transition-all">Formulate a Counter-argument</button>
            `;
        }
    }

    state.podcast.ep = concept.podcastEp;
    state.podcast.title = concept.podcastTitle;
    document.getElementById('podcast-ep').innerText = concept.podcastEp;
    document.getElementById('podcast-title').innerText = concept.podcastTitle;
    resetPodcastPlayer();
}

// Podcasts Player Sync
function loadPodcastTranscript() {
    const body = document.getElementById('podcast-transcript-body');
    if (!body) return;
    body.innerHTML = '';

    state.podcast.transcript.forEach((seg, idx) => {
        const block = document.createElement('p');
        block.id = `transcript-seg-${idx}`;
        block.className = 'transition-all duration-300 py-1 px-2 rounded-md';
        
        block.innerHTML = `
            <span class="font-bold uppercase tracking-wider text-[10px] text-secondary mr-2">${seg.speaker}:</span>
            <span class="font-medium text-on-surface dark:text-slate-200">${seg.text}</span>
        `;
        body.appendChild(block);
    });

    syncTranscriptHighlights();
}

function syncTranscriptHighlights() {
    const curTime = state.podcast.currentTime;
    const trans = state.podcast.transcript;
    
    let activeIdx = 0;
    for (let i = 0; i < trans.length; i++) {
        if (curTime >= trans[i].time) {
            activeIdx = i;
        }
    }

    trans.forEach((_, idx) => {
        const segEl = document.getElementById(`transcript-seg-${idx}`);
        if (!segEl) return;
        
        if (idx === activeIdx) {
            segEl.className = 'bg-secondary/10 dark:bg-secondary/20 scale-[1.01] border-l-2 border-secondary pl-3 font-semibold transition-all duration-200';
            segEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            segEl.className = 'opacity-50 py-1 px-2 rounded-md border-l border-transparent transition-all duration-200';
        }
    });
}

function buildWaveformElements() {
    const container = document.getElementById('podcast-waveform');
    if (!container) return;
    container.innerHTML = '';
    
    const barsCount = 20;
    const heights = [12, 24, 16, 28, 20, 10, 26, 15, 32, 22, 18, 30, 25, 14, 20, 8, 22, 12, 16, 10];
    
    for (let i = 0; i < barsCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'w-1 rounded-full wave-bar bg-surface-container dark:bg-slate-700';
        bar.style.height = `${heights[i % heights.length]}px`;
        container.appendChild(bar);
    }
}

function animateWaveform(active) {
    const bars = document.querySelectorAll('.wave-bar');
    bars.forEach((bar, idx) => {
        if (active) {
            bar.className = 'w-1 rounded-full wave-bar bg-secondary';
            bar.style.animation = `wave-pulse ${0.6 + (idx % 4) * 0.2}s infinite ease-in-out alternate`;
            bar.style.animationDelay = `${idx * 0.05}s`;
        } else {
            bar.className = 'w-1 rounded-full wave-bar bg-surface-container dark:bg-slate-700';
            bar.style.animation = 'none';
        }
    });
}

function resetPodcastPlayer() {
    if (state.podcast.intervalId) {
        clearInterval(state.podcast.intervalId);
    }
    state.podcast.isPlaying = false;
    state.podcast.currentTime = 0;
    state.podcast.intervalId = null;

    const ind = document.getElementById('podcast-progress-indicator');
    if (ind) ind.style.width = '0%';
    
    const icon = document.getElementById('podcast-btn-icon');
    if (icon) icon.innerText = 'play_arrow';
    
    animateWaveform(false);
    loadPodcastTranscript();
}

function setupPodcastListeners() {
    const playBtn = document.getElementById('podcast-play-btn');
    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
        if (state.podcast.isPlaying) {
            clearInterval(state.podcast.intervalId);
            state.podcast.isPlaying = false;
            document.getElementById('podcast-btn-icon').innerText = 'play_arrow';
            animateWaveform(false);
        } else {
            state.podcast.isPlaying = true;
            document.getElementById('podcast-btn-icon').innerText = 'pause';
            animateWaveform(true);

            state.podcast.intervalId = setInterval(() => {
                state.podcast.currentTime++;
                if (state.podcast.currentTime > state.podcast.duration) {
                    resetPodcastPlayer();
                    showNotification("Podcast episode completed!");
                } else {
                    const percent = Math.round((state.podcast.currentTime / state.podcast.duration) * 100);
                    document.getElementById('podcast-progress-indicator').style.width = `${percent}%`;
                    syncTranscriptHighlights();
                }
            }, 1000);
        }
    });

    buildWaveformElements();
    loadPodcastTranscript();
}

// Socratic AI Debate chatbox logic
function setupDebateListeners() {
    const input = document.getElementById('debate-chat-input');
    const sendBtn = document.getElementById('debate-send-btn');
    if (!input || !sendBtn) return;

    const sendMessage = () => {
        const text = input.value.trim();
        if (!text) return;

        appendChatMessage('user', text);
        input.value = '';
        simulateAIReply(text);
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function triggerDebatePill(promptText) {
    appendChatMessage('user', promptText);
    simulateAIReply(promptText);
}

function appendChatMessage(sender, text) {
    const chatbox = document.getElementById('debate-chat-box');
    if (!chatbox) return;

    const msg = document.createElement('div');
    msg.className = 'flex items-start gap-4 max-w-3xl message-bubble w-full';
    
    if (sender === 'user') {
        msg.classList.add('justify-end');
        msg.innerHTML = `
            <div class="flex items-start gap-4 max-w-[85%] flex-row-reverse">
                <div class="w-10 h-10 rounded-full bg-primary-container dark:bg-slate-800 text-secondary dark:text-primary-fixed-dim flex items-center justify-center shrink-0 shadow-sm border border-glass-stroke">
                    <span class="material-symbols-outlined text-lg">account_circle</span>
                </div>
                <div class="bg-secondary text-white rounded-2xl rounded-tr-none p-5 text-sm leading-relaxed shadow-sm">
                    ${text}
                </div>
            </div>
        `;
    } else {
        msg.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <span class="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <div class="bg-surface-container dark:bg-slate-700/60 rounded-2xl rounded-tl-none p-5 text-on-surface dark:text-slate-100 text-sm leading-relaxed max-w-[85%]">
                <span class="ai-reply-text"></span>
            </div>
        `;
    }

    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function simulateAIReply(userQuery) {
    const lower = userQuery.toLowerCase();
    let reply = "That is a fascinating objection. Let us examine this further. If we assume circumstances shape us entirely, do we not eliminate accountability? Does the pilot blaming a storm explain his choice to abandon the craft, or was it still an act of choice?";

    if (lower.includes("facticity") || lower.includes("explain")) {
        reply = "Sartre defines facticity as your absolute context—your coordinates in time, birth environment, and physical DNA. Facticity is the raw canvas. How you respond, interpret, and project yourself outward remains absolutely yours. A physical lock keeps you in a room, yes, but choosing to rage, rest, or escape is your radical freedom.";
    } else if (lower.includes("example") || lower.includes("real-life") || lower.includes("trực quan")) {
        reply = "Consider a historical prisoner of war. Their confinement is a severe facticity—a hard wall. They cannot change the lock or the cell. Yet, they remain radically free to choose their spiritual attitude: to resist silently, to despair, to coordinate, or to find dignity in pain. Even in chains, the mind cannot escape choice.";
    } else if (lower.includes("counter") || lower.includes("objection") || lower.includes("biological")) {
        reply = "A powerful critique! Spinoza and modern neuroscientists argue that biological genes, environmental trauma, and subconscious processes program 95% of our actions. Existentialism responds: even if you are heavily predisposed, you remain conscious of your predisposition. The moment you are aware of your limitation, you are free to act for or against it.";
    } else if (lower.includes("sisyphus") || lower.includes("camus")) {
        reply = "Ah, Camus's hero! Sisyphus is condemned to push the stone eternally. His punishment is absolute facticity. But Camus states Sisyphus's victory lies in his silent defiance during the walk down the mountain. By loving his struggle, he negates the punishment and makes the rock his project.";
    } else if (lower.includes("love") || lower.includes("relation")) {
        reply = "Relations are complex. In Sartre's view, we are caught in a cycle of objectification: either we try to possess the other's freedom (Sadism) or surrender ours to them (Masochism). To recognize another's subjectivity without sacrificing ours is the ultimate ethical challenge of existential maturity.";
    }

    setTimeout(() => {
        appendChatMessage('ai', '');
        const activeAIBubbles = document.querySelectorAll('.ai-reply-text');
        const targetSpan = activeAIBubbles[activeAIBubbles.length - 1];
        
        if (!targetSpan) return;
        
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < reply.length) {
                targetSpan.innerHTML += reply[charIndex];
                charIndex++;
                const chatbox = document.getElementById('debate-chat-box');
                if (chatbox) chatbox.scrollTop = chatbox.scrollHeight;
            } else {
                clearInterval(typeInterval);
            }
        }, 15);
    }, 800);
}

// Tab Switching Control
function switchToTab(tabKey) {
    if (!tabKey) return;
    state.activeTab = tabKey;
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const itemTab = item.getAttribute('data-tab');
        if (itemTab === tabKey) {
            item.classList.add('bg-secondary-container', 'text-on-secondary-container', 'translate-x-1');
            item.classList.remove('text-on-surface-variant', 'dark:text-outline-variant');
        } else {
            item.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'translate-x-1');
            item.classList.add('text-on-surface-variant', 'dark:text-outline-variant');
        }
    });

    const views = document.querySelectorAll('.tab-content');
    views.forEach(v => {
        v.classList.remove('active');
    });

    const targetId = `view-${tabKey}`;
    const activeView = document.getElementById(targetId);
    if (activeView) {
        activeView.classList.add('active');
    }

    if (tabKey === 'journey') {
        setTimeout(initMindmap, 50);
    } else if (tabKey === 'flashcards') {
        initFlashcards();
    } else if (tabKey === 'concept') {
        setTimeout(() => {
            loadConcept(state.activeConcept);
        }, 50);
    }
}

// Theme loading & persistent toggling
function initTheme() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const savedTheme = localStorage.getItem('philo-theme') || 'light';
    setTheme(savedTheme);

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const current = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            setTheme(current);
        });
    });
}

function setTheme(themeKey) {
    state.theme = themeKey;
    const html = document.documentElement;
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    
    if (themeKey === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
        toggles.forEach(t => {
            const span = t.querySelector('span.w-5');
            if (span) span.className = 'w-5 h-5 bg-white rounded-full absolute top-0.5 left-6.5 transition-all';
        });
    } else {
        html.classList.remove('dark');
        html.classList.add('light');
        toggles.forEach(t => {
            const span = t.querySelector('span.w-5');
            if (span) span.className = 'w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-all';
        });
    }
    localStorage.setItem('philo-theme', themeKey);
}

// Settings Toggle Switch Helper
function toggleSetting(btn) {
    const isChecked = btn.classList.contains('bg-secondary');
    const span = btn.querySelector('span');
    
    if (isChecked) {
        btn.className = 'w-12 h-6 bg-slate-300 rounded-full relative transition-colors duration-200';
        span.className = 'w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-all';
        showNotification("Autoplay Podcasts turned off.");
    } else {
        btn.className = 'w-12 h-6 bg-secondary rounded-full relative transition-colors duration-200';
        span.className = 'w-5 h-5 bg-white rounded-full absolute top-0.5 left-6.5 transition-all';
        showNotification("Autoplay Podcasts turned on.");
    }
}

// Upgrade Modal Toggle
function toggleUpgradeModal(open) {
    const modal = document.getElementById('upgrade-modal');
    if (!modal) return;
    
    const content = modal.querySelector('div.relative');

    if (open) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 50);
    } else {
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('opacity-0', 'pointer-events-none');
        }, 150);
    }
}

function purchaseSagePlan() {
    toggleUpgradeModal(false);
    showNotification("Welcome to Sage! Full philosophy mindmaps unlocked.");
    
    const lockedNode = document.querySelector('.bg-slate-300');
    if (lockedNode) {
        lockedNode.className = 'w-40 bg-surface/80 backdrop-blur-xl border border-secondary rounded-full py-2.5 px-4 flex items-center gap-3 cursor-pointer';
        lockedNode.onclick = () => loadConcept('gaze');
        const nodeIcon = lockedNode.querySelector('.material-symbols-outlined');
        nodeIcon.innerText = 'lock_open';
        nodeIcon.className = 'material-symbols-outlined text-sm text-secondary';
        const labelText = lockedNode.querySelector('.text-slate-500');
        labelText.className = 'font-bold text-xs text-primary dark:text-white truncate';
        const subLabel = lockedNode.querySelector('.text-slate-400');
        subLabel.className = 'text-[9px] text-secondary uppercase tracking-wider font-semibold';
    }
}

function showLockedAlert(nodeTitle) {
    showNotification(`Become a 'Sage' member to unlock advanced '${nodeTitle}' modules!`, true);
    toggleUpgradeModal(true);
}

// Toast notification trigger
function showNotification(msg, isAlert = false) {
    const toast = document.getElementById('notification-toast');
    const toastMsg = document.getElementById('notification-message');
    const toastIcon = toast ? toast.querySelector('span.material-symbols-outlined') : null;
    
    if (!toast || !toastMsg) return;
    
    toastMsg.innerText = msg;
    
    if (toastIcon) {
        if (isAlert) {
            toastIcon.innerText = 'warning';
            toastIcon.className = 'material-symbols-outlined text-red-500 text-base';
        } else {
            toastIcon.innerText = 'info';
            toastIcon.className = 'material-symbols-outlined text-secondary text-base';
        }
    }

    toast.classList.remove('opacity-0', 'translate-y-8', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-8', 'pointer-events-none');
        toast.classList.remove('opacity-100', 'translate-y-0');
    }, 3500);
}

// Clear state database
function resetLearningHistory() {
    localStorage.removeItem('philo-theme');
    localStorage.removeItem('philo-state');
    showNotification("All learning records successfully cleared! Refreshing sanctuary...");
    setTimeout(() => {
        window.location.reload();
    }, 1200);
}

// State persist storage
function saveStateToStorage() {
    const cleanState = {
        streak: state.streak,
        cardIndex: state.cardIndex,
        cardMastery: state.cardMastery
    };
    localStorage.setItem('philo-state', JSON.stringify(cleanState));
}

function loadStateFromStorage() {
    const data = localStorage.getItem('philo-state');
    if (!data) return;
    try {
        const parsed = JSON.parse(data);
        if (parsed.streak !== undefined) {
            state.streak = parsed.streak;
        }
        if (parsed.cardIndex !== undefined) {
            state.cardIndex = parsed.cardIndex;
        }
        if (parsed.cardMastery !== undefined) {
            state.cardMastery = parsed.cardMastery;
        }
    } catch(err) {
        console.error("Error restoration philo-state:", err);
    }
}

// Initialization bootstrap
function initializeApp() {
    loadStateFromStorage();
    initTheme();
    initNavigation();
    generateHeatmap();
    setupPodcastListeners();
    setupDebateListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Expose functions globally for inline HTML event handlers
window.switchToTab = switchToTab;
window.loadConcept = loadConcept;
window.rateCard = rateCard;
window.triggerDebatePill = triggerDebatePill;
window.toggleSetting = toggleSetting;
window.toggleUpgradeModal = toggleUpgradeModal;
window.purchaseSagePlan = purchaseSagePlan;
window.showLockedAlert = showLockedAlert;
window.resetLearningHistory = resetLearningHistory;
window.zoomCanvas = zoomCanvas;
window.resetCanvas = resetCanvas;
