$("#block-button").click(async () => {
    if (await isBlocked()) {
        await unblockCurrentWebsite();
        await reloadCurrentPage();
        console.log(blockWebsite);
    } else {
        await blockCurrentWebsite();
        await reloadCurrentPage();
        console.log(blockWebsite);
    }
});

$("#block-specific-button").click(async () => {
    let domain = $("#block-specific-input").val();
    $("#block-specific-input").val(""); 
    await blockSpecificWebsite(domain);
});

$("#chill-button").click(async () => {
    if (! await isBlocked()) return;
    await unblockCurrentWebsite();

    let tmp = new Date();
    console.log("Chill-input: " + $("#chill-input").val());
    let checkpoint = new Date(tmp.getTime() + $("#chill-input").val() * 60000);

    let url = await getCurrentUrl();
    websiteTimeout.set(url, checkpoint.valueOf());

    console.log("Real life: " + url + " " + checkpoint.valueOf());
    console.log(websiteTimeout);
    console.log(websiteTimeout.constructor.name);
    await chrome.storage.local.set({"websiteTimeout": Object.fromEntries(websiteTimeout)});
});