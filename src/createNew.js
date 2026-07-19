import * as bootstrap from "bootstrap"
import { ensureConnection, getKnowledgeObjectStore, getTagsByUsage, recordTagsUsage, decrementTagUsage } from "./database";
import {
    showNewKnowledgeFormBodyEmpty,
    showNewKnowledgeCreated,
    showKnowledgeUpdated,
    showNewKnowledgeFormTagAlreadyAdded,
    showNewKnowledgeFormTagTooShortToast,
    showInvalidUrlToast
} from "./toast";
import { create as createKnowledge } from "./knowledge";
import { renderKnowledgeCard, KNOWLEDGE_EDIT_REQUESTED_EVENT } from "./card";
import { refresh as refreshResults } from "./search";
import { getSettings } from "./settings";
import { resolveFavicon } from "./favicon";
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
    document.getElementById('newKnowledgeFormBookmarkToggle').addEventListener('change', toggleBookmarkMode);
    document.addEventListener(KNOWLEDGE_EDIT_REQUESTED_EVENT, (event) => beginEdit(event.detail.knowledge));
}

function toggleBookmarkMode() {
    const isBookmark = document.getElementById('newKnowledgeFormBookmarkToggle').checked;
    document.getElementById('newKnowledgeFormNoteFields').hidden = isBookmark;
    document.getElementById('newKnowledgeFormBookmarkFields').hidden = !isBookmark;
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

function parseBookmarkBody(body) {
    const match = body.match(/^\[([^\]]*)\]\((\S+)\)$/);
    if (!match) {
        return null;
    }
    return { title: match[1], url: match[2] };
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

    document.getElementById('newKnowledgeFormBookmarkToggle').checked = false;
    document.getElementById('newKnowledgeFormBookmarkTitle').value = "";
    document.getElementById('newKnowledgeFormBookmarkUrl').value = "";
    toggleBookmarkMode();
}

function beginEdit(knowledge) {
    editingKnowledge = knowledge;
    tags = [...knowledge.tags];
    tags.forEach(appendVisibleTag);
    easymde.value(knowledge.body);

    const bookmark = knowledge.tags.includes('bookmark') ? parseBookmarkBody(knowledge.body) : null;
    if (bookmark) {
        document.getElementById('newKnowledgeFormBookmarkTitle').value = bookmark.title;
        document.getElementById('newKnowledgeFormBookmarkUrl').value = bookmark.url;
    }
    document.getElementById('newKnowledgeFormBookmarkToggle').checked = !!bookmark;
    toggleBookmarkMode();

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

    const buildData = document.getElementById('newKnowledgeFormBookmarkToggle').checked
        ? buildBookmarkData()
        : buildNoteData();

    buildData.then((data) => {
        if (!data) {
            return;
        }
        if (editingKnowledge) {
            updateKnowledge(data);
        } else {
            saveNewKnowledge(createKnowledge(data.body, data.tags, data.favicon));
        }
    });
}

function buildNoteData() {
    const body = document.getElementById('newKnowledgeFormBody');

    if (body.value.length < 1) {
        showNewKnowledgeFormBodyEmpty();
        return Promise.resolve(null);
    }

    return Promise.resolve({ body: body.value, tags: [...tags], favicon: null });
}

function buildBookmarkData() {
    const title = document.getElementById('newKnowledgeFormBookmarkTitle');
    const url = document.getElementById('newKnowledgeFormBookmarkUrl');

    if (title.value.length < 1 || url.value.length < 1) {
        showNewKnowledgeFormBodyEmpty();
        return Promise.resolve(null);
    }

    let hostname;
    try {
        hostname = new URL(url.value).hostname;
    } catch (error) {
        showInvalidUrlToast();
        return Promise.resolve(null);
    }

    const bookmarkTags = [...new Set(['bookmark', hostname, ...tags])];
    const body = `[${title.value}](${url.value})`;

    return getSettings()
        .then((settings) => settings.faviconFetchingEnabled ? resolveFavicon(hostname) : null)
        .then((favicon) => ({ body, tags: bookmarkTags, favicon }));
}

function saveNewKnowledge(knowledge) {
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

function updateKnowledge(data) {
    const previousTags = editingKnowledge.tags;
    editingKnowledge.body = data.body;
    editingKnowledge.tags = data.tags;
    editingKnowledge.favicon = data.favicon;

    const request = getKnowledgeObjectStore().put(editingKnowledge);

    request.onsuccess = () => {
        const addedTags = data.tags.filter((tag) => !previousTags.includes(tag));
        const removedTags = previousTags.filter((tag) => !data.tags.includes(tag));

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
