import type { StorageFile, Directory } from './types'

let runtimestorage = {
    vendors: {} as { 
        [key: string]: Directory
    },
    root: null as HTMLObjectElement | null
}

const bakedstorage = {
    version: 0.1,
    releasetype: 'alpha'
}

function internal_isDirectory(obj: any): obj is Directory {
	return obj && typeof obj === 'object' && !('type' in obj)
}

function internal_parsepath ( fpath: string, should_autocheck: boolean = false): [ string, { string: string; arr: string[]; link: Directory | StorageFile | undefined }, { vendorReplaced: boolean; pathChecked: boolean; pathCheckSucceeded: boolean } ] {
	const split = fpath.split(':')
	let vendor = ''
	let rawPath = ''
	let vendorReplaced = false
	let pathChecked = false
	let pathCheckSucceeded = false

	if (split.length === 1) {
		vendor = 'sintasq'
		rawPath = split[0]
		vendorReplaced = true
		should_autocheck = true
	} else {
		vendor = split[0]
		rawPath = split.slice(1).join(':')
	}

	const pathArr = rawPath.split('/')

	let link: Directory | StorageFile | undefined = runtimestorage.vendors?.[vendor]
	for (const segment of pathArr) {
		if (!link || typeof link !== 'object' || 'type' in link) {
			link = undefined
			break
		}
		link = (link as Directory)[segment]
	}

	if (should_autocheck) {
		pathChecked = true
		pathCheckSucceeded = check.path(fpath)
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
	]
}

const check = {
    vendor: (vendor: string, throwErr: boolean = false) => {
        if (runtimestorage.vendors[vendor]) {
            return true
        } else {
            if (throwErr) {
                throw new Error(`Vendor with name ${vendor} does not exist`)
            } else {
                return false
            }
        }
    },
    path: (fpath: string, throwErr: boolean = false) => {
        const split = fpath.split(':')
        let vendor = ''
        let ipath = ''

        if (split.length === 1) {
            vendor = 'sintasq'
            ipath = split[0]
        } else {
            vendor = split[0]
            ipath = split.slice(1).join(':')
        }
        const path = ipath.split('/')
        if (check.vendor(vendor, false)) {
            let cdir = runtimestorage.vendors[vendor]

            for (const ndir of path) {
                const next = cdir[ndir];
                if (!next || "type" in next) {
                    if (throwErr) {
                        throw new Error(`Directory ${ndir} does not exist in ${vendor}:${cdir}/`);
                    } else {
                        return false
                    }
                }
                cdir = next as Directory
            }
            return true
        } else {
            if (throwErr) {
                throw new Error(`Vendor with name ${vendor} does not exist`)
            } else {
                return false
            }
        }
    }
}

const register = {
    vendor: (vendor: string) => {
        if (check.vendor(vendor)) {
            throw new Error(`Vendor with name ${vendor} already exists`)
        }
        runtimestorage.vendors[vendor] = {}
        return true
    },
    directory: (fpath: string) => {
        const [vendor, ipath] = fpath.split(':')
        check.vendor(vendor, true)
        const path = ipath.split('/')
        let cdir: Directory = runtimestorage.vendors[vendor]

        for (const ndir of path) {
            if (!cdir[ndir]) {
                cdir[ndir] = {}
            }
            cdir = cdir[ndir] as Directory
        }
        return true
    },
    method: (fpath: string, data: { name: string; params: any[]; method: Function; }) => { // { method: 'vendor:path/method', args: ['arg1', 'works the same as in functions'] }
        const [vendor, pathObj] = internal_parsepath(fpath, true)
        if (!pathObj.link || pathObj.link == undefined) {
            throw new Error(`Directory ${fpath} does not exist`)
        }
        if (!internal_isDirectory(pathObj.link)) {
            throw new Error(`Path ${fpath} does not seem to point to a directory. Set a StorageFile name using 'data[name]', data is argument 2 starting from 1`)
        }
    },
    component: (fpath: string, data: { name: string, componentdata: any; }) => { // <st-c id="vendor:path/component" arg1="works the same as in html">really</st-c>
        const [vendor, pathObj] = internal_parsepath(fpath, true)
        if (!pathObj.link || pathObj.link == undefined) {
            throw new Error(`Directory ${fpath} does not exist`)
        }
        if (!internal_isDirectory(pathObj.link)) {
            throw new Error(`Path ${fpath} does not seem to point to a directory. Set a StorageFile name using 'data[name]', data is argument 2 starting from 1`)
        }
    },
}

const access = {
    method: (fpath: string, args: any[]) => {

    },
    component: (fpath: string) => {

    }
}

export {}

declare global {
    interface Window {
        sintasq_initializer: Function
    }
}

window.sintasq_initializer = (root: HTMLObjectElement | string) => {
    let realroot: HTMLObjectElement | null = null
    let skiproot = false
    if (root instanceof HTMLObjectElement) {
        realroot = root;
    } else {
        switch (root.charAt(0)) {
            case '.':
                realroot = document.querySelector(root) as HTMLObjectElement
                break
            case '#':
                realroot = document.getElementById(root.slice(1)) as HTMLObjectElement
                break
            case 't':
                skiproot = true
                console.warn('This message must only appear once, if it does twice, make sure you are not using window.sintasq_initializer with "t" as the root parameter, or importing sintasq twice')
                break
            default:
                break
        }
        
        if (!realroot && !skiproot) {
            throw new Error('Could not initialize sintasq: No valid root (HTMLObjectElement) was specified')
        }
    }
    if (!skiproot && realroot) {
        realroot.innerHTML = `sintasq is getting ready... v${bakedstorage.version} ${bakedstorage.releasetype.toUpperCase()}`
        runtimestorage.root = realroot
    }
    return {
        dev: {
            storage: runtimestorage,
            parsepath: internal_parsepath
        },
        check,
        register,
        access
    }
}

register.vendor('sintasq');
register.vendor('pluginstore');
function checkup() { // scoping it so it wont leak into anything
    const st_test = window.sintasq_initializer('t');
    if (st_test.dev || bakedstorage.releasetype.toLowerCase() != 'release') {
        console.warn('%c[sintasq] The current version of Sintasq is suspected to be a DEVELOPER BUILD.', 'font-size: 32px;')
        console.warn('%c[sintasq] IF THIS IS NOT A DEVELOPMENT ENVIRONMENT YOU SHOULD GET THE LATEST STABLE RELEASE.', 'font-size: 32px;')
        console.warn(`[sintasq] checkup detected: devObj: ${st_test.dev ? true : false}; notRelease: ${bakedstorage.releasetype.toLowerCase() != 'release'}`)
    }
    console.info(`[sintasq] Running Sintasq ${bakedstorage.version}, ${bakedstorage.releasetype.toUpperCase()}`)
}
checkup()