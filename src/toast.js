import * as bootstrap from 'bootstrap';

export function showNewKnowledgeFormTagTooShortToast() {
    showToast('newKnowledgeFormTagTooShort');
}

export function showNewKnowledgeFormTagAlreadyAdded() {
    showToast('newKnowledgeFormTagAlreadyAdded');
}

export function showNewKnowledgeFormBodyEmpty() {
    showToast('newKnowledgeFormBodyEmpty');
}

export function showNewKnowledgeCreated() {
    showToast('newKnowledgeFormCreated');
}

export function showKnowledgeUpdated() {
    showToast('newKnowledgeFormUpdated');
}

export function showInvalidUrlToast() {
    showToast('newKnowledgeFormInvalidUrl');
}

export function showKnowledgeDeleted() {
    showToast('knowledgeDeleted');
}

function showToast(id) {
    const toast = document.getElementById(id);
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
    toastBootstrap.show();
}
