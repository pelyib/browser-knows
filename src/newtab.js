import { init as initCreateNewForm } from "./createNew";
import { init as initSearch } from "./search";
import { init as initKnowledgeView } from "./knowledgeView";
import { applyColorTheme } from "./theme";

var browser = require('webextension-polyfill');

function init() {
    applyColorTheme();
    initCreateNewForm();
    initSearch();
    initKnowledgeView();

    document.getElementById('settingsButton').addEventListener('click', () => {
        browser.runtime.openOptionsPage();
    });
};

init();
