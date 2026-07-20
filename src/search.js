import { ensureConnection, getAllKnowledge, getTagUsageMap } from "./database";
import { renderKnowledgeCard, TAG_TOGGLED_EVENT } from "./card";

const PAGE_SIZE = 12;
const MAX_ITEMS = 100;
const DEBOUNCE_MS = 150;

let debounceTimer;
let showingTrash = false;
let currentMatches = [];
let loadedCount = 0;
const selectedTags = new Set();

function isInCurrentView(knowledge) {
    return showingTrash ? !!knowledge.isDeleted : !knowledge.isDeleted;
}

function matchesQuery(knowledge, query) {
    if (!query) {
        return true;
    }
    if (knowledge.body.toLowerCase().includes(query)) {
        return true;
    }
    return knowledge.tags.some((tag) => tag.toLowerCase().includes(query));
}

function matchesSelectedTags(knowledge) {
    if (selectedTags.size === 0) {
        return true;
    }
    return [...selectedTags].every((tag) => knowledge.tags.includes(tag));
}

function computeWeight(knowledge, tagUsage) {
    const tagWeight = knowledge.tags.reduce((sum, tag) => sum + (tagUsage.get(tag) || 0), 0);
    return tagWeight + (knowledge.clickCount || 0);
}

function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function renderSelectedTagsList() {
    const list = document.getElementById('selectedTagsFilter');
    clearChildren(list);

    selectedTags.forEach((tag) => {
        const item = document.createElement('li');
        item.className = 'list-inline-item selected-tag';
        item.innerText = tag;
        item.title = 'Remove tag filter';
        item.addEventListener('click', () => toggleTag(tag));
        list.appendChild(item);
    });
}

function toggleTag(tag) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
    } else {
        selectedTags.add(tag);
    }
    renderSelectedTagsList();
    renderResults();
}

function updateTrashButton() {
    const button = document.getElementById('trashButton');
    button.classList.toggle('active', showingTrash);
    const label = showingTrash ? 'Back to knowledge' : 'View trash';
    button.setAttribute('aria-label', label);
    button.title = label;
}

function toggleTrashView() {
    showingTrash = !showingTrash;
    updateTrashButton();
    renderResults();
}

function loadMore() {
    if (loadedCount >= currentMatches.length || loadedCount >= MAX_ITEMS) {
        return;
    }

    const nextCount = Math.min(loadedCount + PAGE_SIZE, MAX_ITEMS, currentMatches.length);
    currentMatches.slice(loadedCount, nextCount).forEach((knowledge) => renderKnowledgeCard(knowledge, false, selectedTags));
    loadedCount = nextCount;
}

function isSentinelNear() {
    const sentinel = document.getElementById('loadMoreSentinel');
    return sentinel.getBoundingClientRect().top <= window.innerHeight + 400;
}

// IntersectionObserver only fires on an enter/exit transition. If one page of
// results doesn't push the sentinel past the viewport (tall screen, short
// cards), it stays "intersecting" and the observer never fires again, so we
// can't rely on it alone - loop here until the sentinel is actually out of
// range or there's nothing left to load.
function loadWhileSentinelNear() {
    while (isSentinelNear()) {
        const before = loadedCount;
        loadMore();
        if (loadedCount === before) {
            break;
        }
    }
}

function renderResults() {
    const query = document.getElementById('search').value.trim().toLowerCase();

    ensureConnection()
        .then(() => Promise.all([getAllKnowledge(), getTagUsageMap()]))
        .then(([knowledges, tagUsage]) => {
            currentMatches = knowledges
                .filter((knowledge) => isInCurrentView(knowledge) && matchesQuery(knowledge, query) && matchesSelectedTags(knowledge))
                .sort((a, b) => computeWeight(b, tagUsage) - computeWeight(a, tagUsage));

            clearChildren(document.getElementById('container'));
            loadedCount = 0;
            loadWhileSentinelNear();
        })
        .catch((error) => {
            console.log(error);
        });
}

function initInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadWhileSentinelNear();
        }
    }, { rootMargin: '400px' });

    observer.observe(document.getElementById('loadMoreSentinel'));
}

export function init() {
    const input = document.getElementById('search');
    const clearButton = document.getElementById('clearSearch');

    const updateClearButtonVisibility = () => {
        clearButton.classList.toggle('visible', input.value.length > 0);
    };

    input.addEventListener('input', () => {
        updateClearButtonVisibility();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(renderResults, DEBOUNCE_MS);
    });

    clearButton.addEventListener('click', () => {
        input.value = '';
        updateClearButtonVisibility();
        renderResults();
        input.focus();
    });

    document.addEventListener(TAG_TOGGLED_EVENT, (event) => toggleTag(event.detail.tag));
    document.getElementById('trashButton').addEventListener('click', toggleTrashView);

    initInfiniteScroll();
    updateClearButtonVisibility();
    renderResults();
}

export { renderResults as refresh };
