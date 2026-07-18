import { ensureConnection, getAllKnowledge } from "./database";
import { renderKnowledgeCard } from "./card";

const DEFAULT_LIMIT = 6;
const DEBOUNCE_MS = 150;

let debounceTimer;

function matches(knowledge, query) {
    if (knowledge.body.toLowerCase().includes(query)) {
        return true;
    }
    return knowledge.tags.some((tag) => tag.toLowerCase().includes(query));
}

function clearGrid() {
    const grid = document.getElementById('container');
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
}

function renderResults(query) {
    ensureConnection()
        .then(() => getAllKnowledge())
        .then((knowledges) => {
            const results = query
                ? knowledges.filter((knowledge) => matches(knowledge, query))
                : knowledges.slice(0, DEFAULT_LIMIT);

            clearGrid();
            results.forEach((knowledge) => renderKnowledgeCard(knowledge));
        })
        .catch((error) => {
            console.log(error);
        });
}

export function init() {
    const input = document.getElementById('search');

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim().toLowerCase();
        debounceTimer = setTimeout(() => renderResults(query), DEBOUNCE_MS);
    });
}
