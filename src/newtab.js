import { init as initCreateNewForm } from "./createNew";
import { init as initSearch } from "./search";
import { init as initKnowledgeView } from "./knowledgeView";
import { init as initDeleteKnowledge } from "./deleteKnowledge";
import { applyColorTheme } from "./theme";
import { applyCardDensity } from "./density";

function init() {
    applyColorTheme();
    applyCardDensity();
    initCreateNewForm();
    initSearch();
    initKnowledgeView();
    initDeleteKnowledge();
};

init();
