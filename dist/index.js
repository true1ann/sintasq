let runtimestorage = {
    vendors: {}
};
const bakedstorage = {
    version: 0.1,
    releasetype: 'alpha'
};
const register = {
    vendor: (vendor) => {
        if (runtimestorage.vendors[vendor]) {
            throw new Error(`Vendor with name ${vendor} already exists`);
        }
        runtimestorage.vendors[vendor] = { dirs: {} };
    },
    directory: (fpath) => {
        const [vendor, path] = fpath.split(':');
        if (!runtimestorage.vendors[vendor]) {
            throw new Error(`Vendor with name ${vendor} does not exist`);
        }
        const parts = path.split('/');
        let currentDir = runtimestorage.vendors[vendor];
        for (const part of parts) {
            if (!currentDir[part]) {
                currentDir[part] = {};
            }
            currentDir = currentDir[part];
        }
    },
    method: (path, data) => {
    },
    component: (path, data) => {
    },
};
const access = {
    method: (fpath) => {
    },
    component: (fpath) => {
    }
};
window.sintasq_initializer = () => {
    return {
        dev: {
            storage: runtimestorage,
        },
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
