const BROKEN_URL = "!";

const fixUrl = (url) => {
    if (url.length > 7 && url.substring(0, 7) === "http://") url = url.slice(7);
    if (url.length > 8 && url.substring(0, 8) === "https://") url = url.slice(8);
    if (url.length > 4 && url.substring(0, 4) === "www.") url = url.slice(4);

    const dots = url.split(".").length - 1; 
    if (dots == 0) return BROKEN_URL;
    return url;
}

const isBlocked = async () => {
    const tabData = await chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT});
    let _domain = new URL(tabData[0].url).hostname;
    let domain = fixUrl(_domain);
    if (domain === BROKEN_URL) {
        return false;
    }
    if (blockWebsite.includes(domain)) {
        return true;
    }
    return false;
}

const addBlockRule = async (id, domain) => {
    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules:[{
            "id": id,
            "priority": 1,
            "action": {"type": "block"},
            "condition": {"regexFilter": "^(http:\/\/|https:\/\/)?([a-z0-9]+\.)*" + domain, "resourceTypes": ["main_frame"]}}
        ],
        removeRuleIds: [id],
    });
} 

const blockSpecificWebsite = async (domain) => {
    domain = fixUrl(domain);
    if (domain === BROKEN_URL) {
        return;
    }
    if (blockWebsite.includes(domain)) {
        return;
    }
    blockWebsite.push(domain);
    await chrome.storage.local.set({"blockWebsite": blockWebsite});
    await addBlockRule(blockWebsite.length + 1, domain);
} 

const blockCurrentWebsite = async () => {
    const tabData = await chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT});
    let _domain = new URL(tabData[0].url).hostname;
    let domain = fixUrl(_domain);
    if (domain === BROKEN_URL) {
        return;
    }
    if (blockWebsite.includes(domain)) {
        return;
    }
    blockWebsite.push(domain);
    await chrome.storage.local.set({"blockWebsite": blockWebsite});
    await addBlockRule(blockWebsite.length + 1, domain);
    await chrome.tabs.reload();
}

const unblockWebsiteByDomain = async (domain) => {
    blockWebsite = blockWebsite.filter(x => x !== domain);
    await chrome.storage.local.set({"blockWebsite": blockWebsite});
        
    let previousRules = await chrome.declarativeNetRequest.getDynamicRules();
    const previousRuleIds = previousRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: previousRuleIds});

    for (let i = 0; i < blockWebsite.length; i ++)
        await addBlockRule(i + 1, blockWebsite[i]);
}

const unblockCurrentWebsite = async () => {
    const tabData = await chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT});
    let url = new URL(tabData[0].url).hostname;
    url = fixUrl(url);

    if (!blockWebsite.includes(url)) {
        return;
    } 
    await unblockWebsiteByDomain(url);
    await chrome.tabs.reload();
}

const reloadCurrentPage = async () => {
    await chrome.tabs.reload();
}

const reloadBlockPage = async () => {
    const tabData = await chrome.tabs.query({});
    for (let i = 0; i < tabData.length; i ++) {
        let url = new URL(tabData[i].url).hostname.toString();
        url = fixUrl(url);
        if (blockWebsite.includes(url)) 
            await chrome.tabs.reload(tabData[i].id);
    }
}

const getCurrentUrl = async () => {
    const tabData = await chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT});
    let _domain = new URL(tabData[0].url).hostname;
    let domain = fixUrl(_domain);
    return domain;
}