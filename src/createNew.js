import * as bootstrap from "bootstrap"
import { ensureConnection, getKnowledgeObjectStore, getTagsByUsage, recordTagsUsage, decrementTagUsage } from "./database";
import {
    showNewKnowledgeFormBodyEmpty,
    showNewKnowledgeCreated,
    showKnowledgeUpdated,
    showNewKnowledgeFormTagAlreadyAdded,
    showNewKnowledgeFormTagTooShortToast
} from "./toast";
import { create as createKnowledge } from "./knowledge";
import { renderKnowledgeCard, KNOWLEDGE_EDIT_REQUESTED_EVENT } from "./card";
import { refresh as refreshResults } from "./search";
import EasyMDE from "easymde";

let easymde;
let tags;
let editingKnowledge;

export function init() {
    const body = document.getElementById('newKnowledgeFormBody');
    easymde = new EasyMDE({
        lineNumbers: false,
        placeholder: 'A new core memory',
        toolbar: ["bold", "italic", "code", "quote", "|", "table", "horizontal-rule", "preview", "|", "guide"],
        element: body,
        toolbarButtonClassPrefix: "mde",
        forceSync: true,
        autoRefresh:true,
    });
    tags = [];
    editingKnowledge = null;

    document.getElementById('newKnowledgeForm').addEventListener('submit', submit);
    document.getElementById('addTag').addEventListener('click', addTag);
    document.getElementById('newKnowledgeFormModal').addEventListener('show.bs.modal', populateTagSuggestions);
    document.getElementById('newKnowledgeFormModal').addEventListener('hidden.bs.modal', reset);
    document.addEventListener(KNOWLEDGE_EDIT_REQUESTED_EVENT, (event) => beginEdit(event.detail.knowledge));
}

function populateTagSuggestions() {
    ensureConnection()
        .then(() => getTagsByUsage())
        .then((tags) => {
            const datalist = document.getElementById('newKnowledgeFormTagOptions');
            datalist.replaceChildren(...tags.map((tag) => {
                const option = document.createElement('option');
                option.value = tag;
                return option;
            }));
        })
        .catch((error) => {
            console.log(error);
        });
}

function setModalMode(isEdit) {
    document.getElementById('newKnowledgeFormModalTitle').innerText = isEdit ? 'Edit knowledge' : 'An entire new knowledge';
    document.getElementById('newKnowledgeFormSubmitButton').innerText = isEdit ? 'Save' : 'Submit';
}

function reset() {
    easymde.value("");
    tags = [];
    editingKnowledge = null;
    setModalMode(false);

    const visibleTags = document.getElementById('newKnowledgeFormVisibleTags');
    while (visibleTags.firstChild) {
        visibleTags.removeChild(visibleTags.firstChild);
    }
    const newTag = document.getElementById('newKnowledgeFormTag');
    newTag.value = "";
}

function beginEdit(knowledge) {
    editingKnowledge = knowledge;
    tags = [...knowledge.tags];
    tags.forEach(appendVisibleTag);
    easymde.value(knowledge.body);
    setModalMode(true);

    bootstrap.Modal.getOrCreateInstance(document.getElementById('newKnowledgeFormModal')).show();
}

function appendVisibleTag(tag) {
    const visibleTag = document.createElement('li');
    visibleTag.className = 'list-inline-item removable-tag';
    visibleTag.innerText = tag;
    visibleTag.title = 'Click to remove';
    visibleTag.addEventListener('click', () => {
        tags = tags.filter((existing) => existing !== tag);
        visibleTag.remove();
    });

    document.getElementById('newKnowledgeFormVisibleTags').appendChild(visibleTag);
}

function addTag() {
    const newTag = document.getElementById('newKnowledgeFormTag');
    if (newTag.value.length < 3) {
        showNewKnowledgeFormTagTooShortToast();
        return;
    }
    if (tags.includes(newTag.value)) {
        showNewKnowledgeFormTagAlreadyAdded();
        return;
    }

    tags.push(newTag.value);
    appendVisibleTag(newTag.value);

    newTag.value="";
}

function submit(event) {
    event.preventDefault();

    const body = document.getElementById('newKnowledgeFormBody');

    if (body.value.length < 1) {
        showNewKnowledgeFormBodyEmpty();
        return;
    }

    if (editingKnowledge) {
        updateKnowledge(body.value);
    } else {
        createNewKnowledge(body.value);
    }
}

function createNewKnowledge(body) {
    const knowledge = createKnowledge(body, tags);
    const request = getKnowledgeObjectStore().add(knowledge);

    request.onsuccess = (event) => {
        knowledge.id = event.target.result;
        recordTagsUsage(knowledge.tags);
        renderKnowledgeCard(knowledge, true);

        bootstrap.Modal.getInstance(document.getElementById('newKnowledgeFormModal')).hide();

        showNewKnowledgeCreated();
    };

    request.onerror = (event) => {
        console.error("Failed to save new knowledge, reason: ", event.target.error);
    };
}

function updateKnowledge(body) {
    const previousTags = editingKnowledge.tags;
    editingKnowledge.body = body;
    editingKnowledge.tags = tags;

    const request = getKnowledgeObjectStore().put(editingKnowledge);

    request.onsuccess = () => {
        const addedTags = tags.filter((tag) => !previousTags.includes(tag));
        const removedTags = previousTags.filter((tag) => !tags.includes(tag));

        recordTagsUsage(addedTags);
        removedTags.forEach(decrementTagUsage);

        refreshResults();

        bootstrap.Modal.getInstance(document.getElementById('newKnowledgeFormModal')).hide();

        showKnowledgeUpdated();
    };

    request.onerror = (event) => {
        console.error("Failed to update knowledge, reason: ", event.target.error);
    };
}
