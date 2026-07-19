import { converter } from "./markdown";
import { ensureConnection, getAllKnowledge } from "./database";
import { restoreKnowledge } from "./deleteKnowledge";

function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function updateEmptyState() {
    const list = document.getElementById('trashList');
    document.getElementById('trashEmptyMessage').hidden = list.children.length > 0;
}

function renderTrashItem(knowledge) {
    const li = document.createElement('li');
    li.className = 'trash-item';

    const content = document.createElement('div');
    content.className = 'trash-item-body';
    content.innerHTML = converter.makeHtml(knowledge.body);

    const restoreButton = document.createElement('button');
    restoreButton.type = 'button';
    restoreButton.className = 'btn btn-sm btn-outline-secondary trash-item-restore';
    restoreButton.innerText = 'Restore';
    restoreButton.addEventListener('click', () => {
        restoreKnowledge(knowledge);
        li.remove();
        updateEmptyState();
    });

    li.appendChild(content);
    li.appendChild(restoreButton);
    return li;
}

function populateTrash() {
    ensureConnection()
        .then(() => getAllKnowledge())
        .then((knowledges) => {
            const list = document.getElementById('trashList');
            clearChildren(list);

            knowledges
                .filter((knowledge) => knowledge.isDeleted)
                .forEach((knowledge) => list.appendChild(renderTrashItem(knowledge)));

            updateEmptyState();
        })
        .catch((error) => {
            console.log(error);
        });
}

export function init() {
    document.getElementById('trashModal').addEventListener('show.bs.modal', populateTrash);
}
