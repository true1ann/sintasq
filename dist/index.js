let runtimestorage = {
    vendors: {},
    root: null
};
const bakedstorage = {
    version: 0.1,
    releasetype: 'alpha'
};
function internal_isDirectory(obj) {
    return obj && typeof obj === 'object' && !('type' in obj);
}
function internal_parsepath(fpath, should_autocheck = false) {
    var _a;
    const split = fpath.split(':');
    let vendor = '';
    let rawPath = '';
    let vendorReplaced = false;
    let pathChecked = false;
    let pathCheckSucceeded = false;
    if (split.length === 1) {
        vendor = 'sintasq';
        rawPath = split[0];
        vendorReplaced = true;
        should_autocheck = true;
    }
    else {
        vendor = split[0];
        rawPath = split.slice(1).join(':');
    }
    const pathArr = rawPath.split('/');
    let link = (_a = runtimestorage.vendors) === null || _a === void 0 ? void 0 : _a[vendor];
    for (const segment of pathArr) {
        if (!link || typeof link !== 'object' || 'type' in link) {
            link = undefined;
            break;
        }
        link = link[segment];
    }
    if (should_autocheck) {
        pathChecked = true;
        pathCheckSucceeded = check.path(fpath);
    }
    return [
        vendor,
        {
            string: rawPath,
            arr: pathArr,
            link
        },
        {
            vendorReplaced,
            pathChecked,
            pathCheckSucceeded
        }
    ];
}
const check = {
    vendor: (vendor, throwErr = false) => {
        if (runtimestorage.vendors[vendor]) {
            return true;
        }
        else {
            if (throwErr) {
                throw new Error(`Vendor with name ${vendor} does not exist`);
            }
            else {
                return false;
            }
        }
    },
    path: (fpath, throwErr = false) => {
        const split = fpath.split(':');
        let vendor = '';
        let ipath = '';
        if (split.length === 1) {
            vendor = 'sintasq';
            ipath = split[0];
        }
        else {
            vendor = split[0];
            ipath = split.slice(1).join(':');
        }
        const path = ipath.split('/');
        if (check.vendor(vendor, false)) {
            let cdir = runtimestorage.vendors[vendor];
            for (const ndir of path) {
                const next = cdir[ndir];
                if (!next || "type" in next) {
                    if (throwErr) {
                        throw new Error(`Directory ${ndir} does not exist in ${vendor}:${cdir}/`);
                    }
                    else {
                        return false;
                    }
                }
                cdir = next;
            }
            return true;
        }
        else {
            if (throwErr) {
                throw new Error(`Vendor with name ${vendor} does not exist`);
            }
            else {
                return false;
            }
        }
    }
};
const register = {
    vendor: (vendor) => {
        if (check.vendor(vendor)) {
            throw new Error(`Vendor with name ${vendor} already exists`);
        }
        runtimestorage.vendors[vendor] = {};
        return true;
    },
    directory: (fpath) => {
        const [vendor, ipath] = fpath.split(':');
        check.vendor(vendor, true);
        const path = ipath.split('/');
        let cdir = runtimestorage.vendors[vendor];
        for (const ndir of path) {
            if (!cdir[ndir]) {
                cdir[ndir] = {};
            }
            cdir = cdir[ndir];
        }
        return true;
    },
    method: (fpath, data) => {
        const [vendor, pathObj] = internal_parsepath(fpath, true);
        if (!pathObj.link || pathObj.link == undefined) {
            throw new Error(`Directory ${fpath} does not exist`);
        }
        if (!internal_isDirectory(pathObj.link)) {
            throw new Error(`Path ${fpath} does not seem to point to a directory. Set a StorageFile name using 'data[name]', data is argument 2 starting from 1`);
        }
        console.log(pathObj);
        pathObj.link[data.name] = {
            type: 'method',
            data
        };
        console.log(pathObj);
    },
    component: (fpath, data) => {
        const [vendor, pathObj] = internal_parsepath(fpath, true);
        if (!pathObj.link || pathObj.link == undefined) {
            throw new Error(`Directory ${fpath} does not exist`);
        }
        if (!internal_isDirectory(pathObj.link)) {
            throw new Error(`Path ${fpath} does not seem to point to a directory. Set a StorageFile name using 'data[name]', data is argument 2 starting from 1`);
        }
        pathObj.link[data.name] = {
            type: 'component',
            data: data.componentdata
        };
    },
};
const access = {
    method: (fpath, args) => {
        const [vendor, pathObj] = internal_parsepath(fpath, true);
        if (!pathObj.link || pathObj.link == undefined) {
            throw new Error(`Directory ${fpath} does not exist`);
        }
        if (pathObj.link.type != 'method') {
            throw new Error('The file does not seem to be a Method.');
        }
        return pathObj.link.data;
    },
    component: (fpath) => {
        const [vendor, pathObj] = internal_parsepath(fpath, true);
        if (!pathObj.link || pathObj.link == undefined) {
            throw new Error(`Directory ${fpath} does not exist`);
        }
        if (pathObj.link.type != 'directory') {
            throw new Error('The file does not seem to be a Method.');
        }
        return pathObj.link.data;
    }
};
window.sintasq_initializer = (root) => {
    let realroot = null;
    let skiproot = false;
    if (root instanceof HTMLObjectElement) {
        realroot = root;
    }
    else {
        switch (root.charAt(0)) {
            case '.':
                realroot = document.querySelector(root);
                break;
            case '#':
                realroot = document.getElementById(root.slice(1));
                break;
            case 't':
                skiproot = true;
                console.warn('This message must only appear once, if it does twice, make sure you are not using window.sintasq_initializer with "t" as the root parameter, or importing sintasq twice');
                break;
            default:
                break;
        }
        if (!realroot && !skiproot) {
            throw new Error('Could not initialize sintasq: No valid root (HTMLObjectElement) was specified');
        }
    }
    if (!skiproot && realroot) {
        // TODO: Show a full-on compact loading indicator (with a customLib)
        realroot.innerHTML = `sintasq is getting ready... v${bakedstorage.version} ${bakedstorage.releasetype.toUpperCase()}`;
        runtimestorage.root = realroot;
    }
    return {
        dev: {
            storage: runtimestorage,
            parsepath: internal_parsepath
        },
        check,
        register,
        access
    };
};
register.vendor('sintasq');
register.vendor('pluginstore');
function checkup() {
    const st_test = window.sintasq_initializer('t');
    if (st_test.dev || bakedstorage.releasetype.toLowerCase() != 'release') {
        console.warn('%c[sintasq] The current version of Sintasq is suspected to be a DEVELOPER BUILD.', 'font-size: 32px;');
        console.warn('%c[sintasq] IF THIS IS NOT A DEVELOPMENT ENVIRONMENT YOU SHOULD GET THE LATEST STABLE RELEASE.', 'font-size: 32px;');
        console.warn(`[sintasq] checkup detected: devObj: ${!!st_test.dev}; notRelease: ${bakedstorage.releasetype.toLowerCase() != 'release'}`);
    }
    console.info(`[sintasq] Running Sintasq ${bakedstorage.version}, ${bakedstorage.releasetype.toUpperCase()}`);
}
checkup();
export {};
