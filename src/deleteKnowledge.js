import * as bootstrap from "bootstrap";
import { getKnowledgeObjectStore, recordTagsUsage, decrementTagUsage } from "./database";
import {
    KNOWLEDGE_DELETE_REQUESTED_EVENT,
    KNOWLEDGE_RESTORE_REQUESTED_EVENT,
    KNOWLEDGE_PERMANENT_DELETE_REQUESTED_EVENT
} from "./card";
import { refresh as refreshResults } from "./search";
import { showKnowledgeDeleted, showKnowledgePermanentlyDeleted } from "./toast";

let pendingDelete = null;
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

function permanentlyDeleteKnowledge(knowledge) {
    // Tag usage was already decremented when this entry was soft-deleted, so
    // permanently deleting it here must not decrement it a second time.
    const request = getKnowledgeObjectStore().delete(knowledge.id);

    request.onsuccess = () => {
        refreshResults();
        showKnowledgePermanentlyDeleted();
    };

    request.onerror = (event) => {
        console.error("Failed to permanently delete knowledge, reason: ", event.target.error);
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

function showDeleteConfirm(knowledge, permanent) {
    pendingDelete = { knowledge, permanent };

    document.getElementById('deleteConfirmModalTitle').innerText = permanent
        ? 'Delete permanently?'
        : 'Delete this entry?';
    document.getElementById('deleteConfirmModalBody').innerText = permanent
        ? "This removes it for good — it won't be in the trash anymore."
        : 'You can restore it later from the trash.';
    document.getElementById('deleteConfirmButton').innerText = permanent ? 'Delete permanently' : 'Delete';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteConfirmModal')).show();
}

export function init() {
    document.addEventListener(KNOWLEDGE_DELETE_REQUESTED_EVENT, (event) => {
        showDeleteConfirm(event.detail.knowledge, false);
    });

    document.addEventListener(KNOWLEDGE_PERMANENT_DELETE_REQUESTED_EVENT, (event) => {
        showDeleteConfirm(event.detail.knowledge, true);
    });

    document.getElementById('deleteConfirmButton').addEventListener('click', () => {
        if (pendingDelete) {
            if (pendingDelete.permanent) {
                permanentlyDeleteKnowledge(pendingDelete.knowledge);
            } else {
                softDeleteKnowledge(pendingDelete.knowledge);
            }
            pendingDelete = null;
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

    document.addEventListener(KNOWLEDGE_RESTORE_REQUESTED_EVENT, (event) => {
        restoreKnowledge(event.detail.knowledge);
    });
}
