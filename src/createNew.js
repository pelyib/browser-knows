import * as bootstrap from "bootstrap"
import { getKnowledgeObjectStore } from "./database";
import { 
    showNewKnowledgeFormBodyEmpty,
    showNewKnowledgeCreated,
    showNewKnowledgeFormTagAlreadyAdded,
    showNewKnowledgeFormTagTooShortToast
} from "./toast";

const tags = [];

export function addTag() {
    const newTag = document.getElementById('newKnowledgeFormTag');
    if (newTag.value.length < 3) {
        showNewKnowledgeFormTagTooShortToast();
        return;
    }
    if (tags.includes(newTag.value)) {
        showNewKnowledgeFormTagAlreadyAdded();
        return;
    }

    const visibleTag = document.createElement('li');
    visibleTag.className = 'list-inline-item';
    visibleTag.innerText = newTag.value;
    tags.push(newTag.value);

    document.getElementById('newKnowledgeFormVisibleTags').appendChild(visibleTag);

    newTag.value="";
}

export function create() {
    event.preventDefault();

    const body = document.getElementById('newKnowledgeFormBody');

    if (body.value.length < 1) {
        showNewKnowledgeFormBodyEmpty();
        return;
    }

    const knowledge = {
        tags: tags,
        body: body.value,
    }

    getKnowledgeObjectStore().add(knowledge);

    // reset form
    // rerender the list

    const formModal = bootstrap.Modal.getInstance(document.getElementById('newKnowledgeFormModal'));
    formModal.hide();

    showNewKnowledgeCreated();
}
