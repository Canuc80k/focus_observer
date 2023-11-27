const BROKEN_URL = "!";

const fixUrl = (url) => {
    if (url.length > 7 && url.substring(0, 7) === "http://") url = url.slice(7);
    if (url.length > 8 && url.substring(0, 8) === "https://") url = url.slice(8);
    if (url.length > 4 && url.substring(0, 4) === "www.") url = url.slice(4);

    const dots = url.split(".").length - 1; 
    if (dots == 0) return BROKEN_URL;
    return url;
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

const reloadBlockPage = async () => {
    const tabData = await chrome.tabs.query({});
    for (let i = 0; i < tabData.length; i ++) {
        let url = new URL(tabData[i].url).hostname.toString();
        url = fixUrl(url);
        if (blockWebsite.includes(url)) 
            await chrome.tabs.reload(tabData[i].id);
    }
}

let blockWebsite;

const checkDataAvailable = (data, dataType) => {
    if (data != undefined && data.constructor.name == dataType) return true;
    return false;
}

setInterval(async () => {
    console.log(Date.now());
    await chrome.storage.local.get().then(async (data) => {
        blockWebsite = [];
        try {
            websiteTimeout = new Map(Object.entries(data.websiteTimeout));
        } catch (e) {
            websiteTimeout = new Map();
        }

        if (checkDataAvailable(data.blockWebsite, "Array")) blockWebsite = data.blockWebsite;
        console.log(websiteTimeout);
    
        for (let [key, value] of websiteTimeout) {
            if (Date.now() > value) {
                await blockSpecificWebsite(key);
                websiteTimeout.delete(key);
                await reloadBlockPage();
                await chrome.storage.local.set({"websiteTimeout": Object.fromEntries(websiteTimeout)});
            }
            console.log(key + " " + Date.now() + " " + value);
        }
        console.log(data.blockWebsite);
    });
}, 1000);