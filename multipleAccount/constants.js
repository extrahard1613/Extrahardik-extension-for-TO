export const TABS = ["first", "second", "third"];
export const STORAGE_SUFFIX = "AccountListData";
export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const SELECTORS = {
    LOBBY: {
        NICKNAME: ".UserInfoContainerStyle-userNameRank.UserInfoContainerStyle-textDecoration",
        RANK_ICON: ".UserInfoContainerStyle-titleRankIcon",
        CRYSTALS_ICON: ".UserScoreComponentStyle-iconCrystal",
        RUBIES_ICON: ".-iconCoinSizeMedium",
        PREMIUM_BUTTON: ".UserInfoContainerStyle-blockLeftPanel .UserInfoContainerStyle-userTitleContainer .-flexCenterAlignCenterColumn .-backgroundImageCover",
        
        NEWS: ".FooterComponentStyle-newsButton",
        OPENBUTTON: ".FooterComponentStyle-accountsButton",
        MENU: ".FooterComponentStyle-containerMenu",
        LOADING: ".ApplicationLoaderComponentStyle-container",
    },
    PREMIUM: {
        OVERLAY: ".ModalStyle-shaded",
        MODAL: ".DialogPremiumAccountStyle-mainScreen",
        PREMIUM_TEXT: ".UserInfoContainerStyle-grayColor > :nth-child(1)",
        NOPREMIUM: ".DialogPremiumAccountStyle-noPremium",
        CLOSEBUTTON: ".DialogPremiumAccountStyle-closeButton",
    },
    SHOP: {
        TANKCOINS_ICON: ".UserScoreComponentStyle-coinIcon",
    },
    UI: {
        SEARCH_INPUT: ".searchAccountInput",
        TAB_UNDERLINE: (tab) => `${tab}ActiveTabUnderline`,
        TAB_LIST: (tab) => `${tab}AccountList`,
        TAB_TEXT: (tab) => `${tab}Tab-textContent`,
        MODAL: ".multipleAccount",
        CONTAINER: ".multipleAccount-popupContainer",
        ADDBUTTON: ".addAccountButton",
        ACCOUNT: ".accountName-textContent",
        POPUP: ".multipleAccount-popupContainer",
        CLOSEBUTTON: ".closeMultipleAccountButton-Container",
    },
    REGISTRATION: {
        LOGIN: '[class*="EntranceComponentStyle-container"]',
    },
};
