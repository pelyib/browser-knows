import { ensureConnection, getAllKnowledge } from "./database";
import { init as initCreateNewForm } from "./createNew";
import { init as initSearch } from "./search";
import { renderKnowledgeCard } from "./card";
import { applyColorTheme } from "./theme";

function renderKnowledgeCards(limit) {
    ensureConnection()
        .then(() => getAllKnowledge())
        .then((knowledges) => {
            knowledges.slice(0, limit).forEach((knowledge) => renderKnowledgeCard(knowledge));
        })
        .catch((error) => {
            console.log(error);
        })
}

function init() {
    applyColorTheme();
    initCreateNewForm();
    initSearch();
    renderKnowledgeCards(6);
};

init();
