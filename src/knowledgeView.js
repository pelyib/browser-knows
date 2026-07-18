import * as bootstrap from "bootstrap";
import { converter } from "./markdown";
import { getKnowledgeObjectStore } from "./database";
import { KNOWLEDGE_OPENED_EVENT } from "./card";

function incrementClickCount(knowledge) {
    knowledge.clickCount = (knowledge.clickCount || 0) + 1;
    getKnowledgeObjectStore().put(knowledge);
}

function showKnowledge(knowledge) {
    const body = document.getElementById('knowledgeViewBody');
    body.innerHTML = converter.makeHtml(knowledge.body);

    const tagsList = document.getElementById('knowledgeViewTags');
    tagsList.replaceChildren(...knowledge.tags.map((tag) => {
        const item = document.createElement('li');
        item.className = 'list-inline-item';
        item.innerText = tag;
        return item;
    }));

    bootstrap.Modal.getOrCreateInstance(document.getElementById('knowledgeViewModal')).show();
}

export function init() {
    document.addEventListener(KNOWLEDGE_OPENED_EVENT, (event) => {
        const knowledge = event.detail.knowledge;
        incrementClickCount(knowledge);
        showKnowledge(knowledge);
    });
}
