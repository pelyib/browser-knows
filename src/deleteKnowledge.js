import * as bootstrap from "bootstrap";
import { getKnowledgeObjectStore, recordTagsUsage, decrementTagUsage } from "./database";
import { KNOWLEDGE_DELETE_REQUESTED_EVENT } from "./card";
import { refresh as refreshResults } from "./search";
import { showKnowledgeDeleted } from "./toast";

let pendingKnowledge = null;
let lastDeletedKnowledge = null;

function softDeleteKnowledge(knowledge) {
    knowledge.isDeleted = true;
    const request = getKnowledgeObjectStore().put(knowledge);

    request.onsuccess = () => {
        knowledge.tags.forEach(decrementTagUsage);
        refreshResults();
        lastDeletedKnowledge = knowledge;
        showKnowledgeDeleted();
    };

    request.onerror = (event) => {
        console.error("Failed to delete knowledge, reason: ", event.target.error);
    };
}

export function restoreKnowledge(knowledge) {
    knowledge.isDeleted = false;
    const request = getKnowledgeObjectStore().put(knowledge);

    request.onsuccess = () => {
        recordTagsUsage(knowledge.tags);
        refreshResults();
    };

    request.onerror = (event) => {
        console.error("Failed to restore knowledge, reason: ", event.target.error);
    };
}

export function init() {
    document.addEventListener(KNOWLEDGE_DELETE_REQUESTED_EVENT, (event) => {
        pendingKnowledge = event.detail.knowledge;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteConfirmModal')).show();
    });

    document.getElementById('deleteConfirmButton').addEventListener('click', () => {
        if (pendingKnowledge) {
            softDeleteKnowledge(pendingKnowledge);
            pendingKnowledge = null;
        }
        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
    });

    document.getElementById('undoDeleteButton').addEventListener('click', () => {
        if (lastDeletedKnowledge) {
            restoreKnowledge(lastDeletedKnowledge);
            lastDeletedKnowledge = null;
        }
        bootstrap.Toast.getInstance(document.getElementById('knowledgeDeleted'))?.hide();
    });
}
