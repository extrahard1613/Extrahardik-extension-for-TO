import { expectElement} from "../helpers.js";
import { MINUTE, HOUR, DAY, SELECTORS } from "./constants.js";

const ANIMATION_MS = 500;
const SAFETY_BUFFER = 80;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForAnimation(element, fallback = ANIMATION_MS + SAFETY_BUFFER) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        let finished = false;

        const done = () => {
            if (finished) return;
            finished = true;
            element.removeEventListener("animationend", done);
            resolve();
        };

        element.addEventListener("animationend", done, { once: true });
        setTimeout(done, fallback);
    });
}

function parsePremiumText(text, symbol) {
    return +(text.match(new RegExp(`(\\d+)\\s*${symbol}`))?.[1] || 0);
}

export function calculatePremiumExpiration(text) {
    if (!text || text === "-") return -1;

    const days = parsePremiumText(text, "д");
    const hours = parsePremiumText(text, "ч");
    const minutes = parsePremiumText(text, "м");

    const totalMs =
        days * DAY +
        hours * HOUR +
        minutes * MINUTE;

    return totalMs > 0
        ? new Date(Date.now() + totalMs)
        : -1;
}

export function countRestOfPremiumAccount(account) {
    const expiresAt = new Date(account.premiumAccountExpiration).getTime();
    const diff = expiresAt - Date.now();

    if (!Number.isFinite(expiresAt) || diff <= 0) {
        return "-";
    }

    const days = Math.floor(diff / DAY);
    const hours = Math.floor((diff % DAY) / HOUR);
    const minutes = Math.floor((diff % HOUR) / MINUTE);

    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;

    return `${minutes}м`;
}

function readPremiumValue() {
    const premiumText = document.querySelector(SELECTORS.PREMIUM.PREMIUM_TEXT);

    const noPremium = document.querySelector(SELECTORS.PREMIUM.NOPREMIUM);

    if (premiumText) 
        return premiumText.textContent.trim() || "-";

    if (noPremium) 
        return "-";

    return "-";
}

export async function getPremiumAccountInformation() {
    const button = await expectElement(SELECTORS.LOBBY.PREMIUM_BUTTON);
    button.click();

    const overlay = await expectElement(SELECTORS.PREMIUM.OVERLAY);
    const modal = await expectElement(SELECTORS.PREMIUM.MODAL);

    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    modal.style.animation = "none";

    const premiumAccount = readPremiumValue();

    triggerEscape(overlay);

    setTimeout(() => {
        overlay.style.opacity = "1";
    }, 200);

    return premiumAccount;
}

function triggerEscape(targetElement = document) {
    const eventSettings = {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
    };

    targetElement.dispatchEvent(new KeyboardEvent("keydown", eventSettings));
    targetElement.dispatchEvent(new KeyboardEvent("keyup", eventSettings));
}
