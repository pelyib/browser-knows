import { init as initCreateNewForm } from "./createNew";
import { init as initSearch } from "./search";
import { init as initKnowledgeView } from "./knowledgeView";
import { applyColorTheme } from "./theme";

function init() {
    applyColorTheme();
    initCreateNewForm();
    initSearch();
    initKnowledgeView();
};

init();
