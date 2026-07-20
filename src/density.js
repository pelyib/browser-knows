import { getSettings } from "./settings";

export function applyCardDensity() {
    return getSettings().then((settings) => {
        document.documentElement.setAttribute('data-density', settings.cardDensity);
    });
}
