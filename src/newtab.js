import { ensureConnection, getKnowledgeObjectStore } from "./database";
import { init as initCreateNewForm } from "./createNew";
import { renderKnowledgeCard } from "./card";
import { applyColorTheme } from "./theme";

function renderKnowledgeCards(limit) {
    ensureConnection()
        .then(() => {
            const knowledges = getKnowledgeObjectStore();
            let cardsCount = 0;
            knowledges.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;
                if (cardsCount < limit && cursor) {
                    renderKnowledgeCard(cursor.value);
                    cardsCount++;
                    cursor.continue();
                }
            };
        })
        .catch((error) => {
            console.log(error);
        })
}

function init() {
    applyColorTheme();
    initCreateNewForm();
    renderKnowledgeCards(6);
};

init();
