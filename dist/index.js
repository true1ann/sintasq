let runtimestorage = {
    vendors: {}
};
const bakedstorage = {
    version: 0.1,
    releasetype: 'alpha'
};
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
        const [vendor, ipath] = fpath.split(':');
        const path = ipath.split('/');
        if (check.vendor(vendor, false)) {
            // check if runtimestorage.vendors{path}.type exists
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
        if (!runtimestorage.vendors[vendor]) {
            throw new Error(`Vendor with name ${vendor} does not exist`);
        }
        const parts = path.split('/');
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
