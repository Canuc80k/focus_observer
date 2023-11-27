let blockWebsite, websiteTimeout;

const checkDataAvailable = (data, dataType) => {
    if (data != undefined && data.constructor.name == dataType) return true;
    return false;
}

const unblockAllWebsite = async () => {
    let previousRules = await chrome.declarativeNetRequest.getDynamicRules();
    const previousRuleIds = previousRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: previousRuleIds});
    blockWebsite = [];
    await chrome.storage.local.set({"blockWebsite": blockWebsite});
}

window.onload = () => {
    chrome.storage.local.get().then((data) => {
        blockWebsite = [];        
        try {
            websiteTimeout = new Map(Object.entries(data.websiteTimeout));
        } catch (e) {
            websiteTimeout = new Map();
        }
        if (checkDataAvailable(data.blockWebsite, "Array")) blockWebsite = data.blockWebsite;
    });
};