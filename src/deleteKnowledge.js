import * as bootstrap from "bootstrap";
import { getKnowledgeObjectStore, decrementTagUsage } from "./database";
import { KNOWLEDGE_DELETE_REQUESTED_EVENT } from "./card";
import { refresh as refreshResults } from "./search";
import { showKnowledgeDeleted } from "./toast";

let pendingKnowledge = null;

function deleteKnowledge(knowledge) {
    const request = getKnowledgeObjectStore().delete(knowledge.id);

    request.onsuccess = () => {
        knowledge.tags.forEach(decrementTagUsage);
        refreshResults();
        showKnowledgeDeleted();
    };

    request.onerror = (event) => {
        console.error("Failed to delete knowledge, reason: ", event.target.error);
    };
}

export function init() {
    document.addEventListener(KNOWLEDGE_DELETE_REQUESTED_EVENT, (event) => {
        pendingKnowledge = event.detail.knowledge;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteConfirmModal')).show();
    });

    document.getElementById('deleteConfirmButton').addEventListener('click', () => {
        if (pendingKnowledge) {
            deleteKnowledge(pendingKnowledge);
            pendingKnowledge = null;
        }
        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
    });
}
