import commonHelper from './common.js'

const targets = [
    /^https?:\/\/(www\.|)tiktok\.com.*/
];

let redirects = {
    "proxiTok": {
        "normal": [
            "https://proxitok.herokuapp.com",
        ]
    }
}

const getRedirects = () => redirects;
function setRedirects(val) {
    redirects.proxiTok = val;
    browser.storage.sync.set({ tiktokRedirects: redirects })
    console.log("tiktokRedirects: ", val)
    for (const item of proxiTokRedirectsChecks)
        if (!redirects.proxiTok.normal.includes(item)) {
            var index = proxiTokRedirectsChecks.indexOf(item);
            if (index !== -1) proxiTokRedirectsChecks.splice(index, 1);
        }
    setProxiTokRedirectsChecks(proxiTokRedirectsChecks);
}

let proxiTokRedirectsChecks;
const getProxiTokRedirectsChecks = () => proxiTokRedirectsChecks;
function setProxiTokRedirectsChecks(val) {
    proxiTokRedirectsChecks = val;
    browser.storage.sync.set({ proxiTokRedirectsChecks })
    console.log("proxiTokRedirectsChecks: ", val)
}

let proxiTokCustomRedirects = [];
const getProxiTokCustomRedirects = () => proxiTokCustomRedirects;
function setProxiTokCustomRedirects(val) {
    proxiTokCustomRedirects = val;
    browser.storage.sync.set({ proxiTokCustomRedirects })
    console.log("proxiTokCustomRedirects: ", val)
}

let disableTiktok;
const getDisableTiktok = () => disableTiktok;
function setDisableTiktok(val) {
    disableTiktok = val;
    browser.storage.sync.set({ disableTiktok })
}

function redirect(url, initiator, type) {
    // https://www.tiktok.com/@keysikaspol/video/7061265241887345946
    // https://www.tiktok.com/@keysikaspol

    if (disableTiktok) return null;

    if (type != "main_frame" && "sub_frame" && "xmlhttprequest") return null;

    let instancesList = [...proxiTokRedirectsChecks, ...proxiTokCustomRedirects];
    if (instancesList.length === 0) return null;
    let randomInstance = commonHelper.getRandomInstance(instancesList)

    if (initiator && (instancesList.includes(initiator.origin) || targets.includes(initiator.host))) return null;

    let pathName = url.pathname.replace(new RegExp(/@.*\/(?=video)/), "")

    return `${randomInstance}${pathName}`;
}

function isTiktok(url) {
    return targets.some((rx) => rx.test(url.href));
}

async function init() {
    let result = await browser.storage.sync.get([
        "disableTiktok",
        "tiktokRedirects",
        "proxiTokRedirectsChecks",
        "proxiTokCustomRedirects",
    ])
    disableTiktok = result.disableTiktok ?? false;
    if (result.tiktokRedirects)
        redirects = result.tiktokRedirects;

    proxiTokRedirectsChecks = result.proxiTokRedirectsChecks ?? [...redirects.proxiTok.normal];
    proxiTokCustomRedirects = result.proxiTokCustomRedirects ?? [];
}

export default {
    targets,

    getRedirects,
    setRedirects,

    getDisableTiktok,
    setDisableTiktok,

    getProxiTokRedirectsChecks,
    setProxiTokRedirectsChecks,

    getProxiTokCustomRedirects,
    setProxiTokCustomRedirects,

    redirect,
    isTiktok,
    init,
};