let runtimestorage = {
    vendors: {}
};
const bakedstorage = {
    version: 0.1,
    releasetype: 'alpha'
};
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
        const [vendor, path] = fpath.split(':');
        if (!runtimestorage.vendors[vendor]) {
            throw new Error(`Vendor with name ${vendor} does not exist`);
        }
        const parts = path.split('/');
    },
    component: (fpath, data) => {
        const [vendor, path] = fpath.split(':');
        const parts = path.split('/');
        check.vendor(vendor, true);
    },
};
const access = {
    method: (fpath, args) => {
    },
    component: (fpath) => {
    }
};
window.sintasq_initializer = () => {
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
    const st_test = window.sintasq_initializer();
    if (st_test.dev || bakedstorage.releasetype.toLowerCase() != 'release') {
        console.warn('%c[sintasq] The current version of Sintasq is suspected to be a DEVELOPER BUILD.', 'font-size: 32px;');
        console.warn('%c[sintasq] IF THIS IS NOT A DEVELOPMENT ENVIRONMENT YOU SHOULD GET THE LATEST STABLE RELEASE.', 'font-size: 32px;');
    }
    console.info(`[sintasq] Running Sintasq ${bakedstorage.version}, ${bakedstorage.releasetype.toUpperCase()}`);
}
checkup();
export {};
