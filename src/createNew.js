import * as bootstrap from "bootstrap"
import { getKnowledgeObjectStore } from "./database";
import { 
    showNewKnowledgeFormBodyEmpty,
    showNewKnowledgeCreated,
    showNewKnowledgeFormTagAlreadyAdded,
    showNewKnowledgeFormTagTooShortToast
} from "./toast";
import { create as createKnowledge } from "./knowledge";
import EasyMDE from "easymde";

let easymde;
let tags;

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

    document.getElementById('newKnowledgeForm').addEventListener('submit', create);
    document.getElementById('addTag').addEventListener('click', addTag);
}

function reset() {
    easymde.value("");
    tags = [];

    const visibleTags = document.getElementById('newKnowledgeFormVisibleTags');
    while (visibleTags.firstChild) {
        visibleTags.removeChild(visibleTags.firstChild);
    }
    const newTag = document.getElementById('newKnowledgeFormTag');
    newTag.value = "";
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

    const visibleTag = document.createElement('li');
    visibleTag.className = 'list-inline-item';
    visibleTag.innerText = newTag.value;
    tags.push(newTag.value);

    document.getElementById('newKnowledgeFormVisibleTags').appendChild(visibleTag);

    newTag.value="";
}

function create() {
    event.preventDefault();

    const body = document.getElementById('newKnowledgeFormBody');

    if (body.value.length < 1) {
        showNewKnowledgeFormBodyEmpty();
        return;
    }

    const knowledge = createKnowledge(body.value, tags);

    getKnowledgeObjectStore().add(knowledge);

    reset();
    // rerender the list

    const formModal = bootstrap.Modal.getInstance(document.getElementById('newKnowledgeFormModal'));
    formModal.hide();

    showNewKnowledgeCreated();
}
