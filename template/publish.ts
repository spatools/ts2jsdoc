import template = require("jsdoc/template");
import fs = require("jsdoc/fs");
import path = require("jsdoc/path");
import doop = require("jsdoc/util/doop");
import logger = require("jsdoc/util/logger");
import helper = require("jsdoc/util/templateHelper");

var htmlsafe = helper.htmlsafe,
    linkto = helper.linkto,
    resolveAuthorLinks = helper.resolveAuthorLinks,
    scopeToPunc = helper.scopeToPunc,
    hasOwnProp = Object.prototype.hasOwnProperty,
    outdir = env.opts.destination,
    data: JSDoc.TaffyDB<TemplateDoclet>,
    taffy = require("taffydb").taffy,
    view: CustomTemplate;

var globalUrl = helper.getUniqueFilename("global"),
    indexUrl = helper.getUniqueFilename("index"),

    simplifyGenericRegex = /\.(?:(?:<)|(?:&lt;))/g,
    arrayInGenReplaceRegex = /(?:(?:<)|(?:&lt;))Array\.(?:(?:<)|(?:&lt;))(.+)>(\s*(?!(?:[<\|])|(?:&lt;)))?>/i,
    arrayReplaceRegex = /Array\.(?:(?:<)|(?:&lt;))(.+)>(\s*(?!(?:[<\|])|(?:&lt;)))?/i;

//#region JSDoc.ts

interface CustomTemplate extends template.Template {
    find?: typeof find;
    linkto?: typeof linkto;
    resolveAuthorLinks?: typeof resolveAuthorLinks;
    tutoriallink?: typeof tutoriallink;
    htmlsafe?: typeof htmlsafe;
    outputSourceFiles?: boolean;
    nav?: TemplateNav;
    options?: TemplateOptions;
    isEntrySelected?: typeof isEntrySelected;
}

interface TemplateDoclet extends JSDoc.Doclet {
    id?: string;
    signature?: string;
    displayname?: string;
    attribs?: string;
    modules?: TemplateDoclet[];
    examples?: any[];
    ancestors?: string[];
}

interface TypescriptMembersResult extends helper.GetMembersResult {
    enums: TemplateDoclet[];
    interfaces: TemplateDoclet[];
    callbacks: TemplateDoclet[];
    typedef: TemplateDoclet[];
    tutorials?: any;
}

interface TemplateOptions {
    systemName?: string;
    theme?: string;
    navType?: string;
    inverseNav?: boolean;
    tableOfContents?: boolean;
    linenums?: boolean;
    collapseSymbols?: boolean;
    footer?: string;
    copyright?: string;
    syntaxTheme?: string;
    outputSourceFiles?: boolean;
    outputSourcePath?: boolean;
    sourceRootPath?: string;
    analytics?: {
        ua: string;
        domain: string;
    };
}

interface TemplateNavMember {
    name: string;
    longname: string;
    link: string;
}
interface TemplateNavSection {
    title: string;
    link: string;
    members: TemplateNavMember[];
}
interface TemplateNav {
    index: TemplateNavSection;
    class: TemplateNavSection;
    interface: TemplateNavSection;
    external: TemplateNavSection;
    global: TemplateNavSection;
    mixin: TemplateNavSection;
    module: TemplateNavSection;
    namespace: TemplateNavSection;
    tutorial: TemplateNavSection;
    event: TemplateNavSection;
    typedef: TemplateNavSection;
    enum: TemplateNavSection;
    callback: TemplateNavSection;

    topLevel: TemplateNavSection[];
    searchMembers: TemplateNavMember[];
}

interface TemplateSourceFile {
    resolved: string;
    shortened: string;
};

function flatten<T>(array: T[][]): T[] {
    return Array.prototype.concat.apply([], array);
}

function formatType(typeName: string): string {
    return typeName
        .replace(arrayInGenReplaceRegex, "&lt;$1[]$2>")
        .replace(arrayReplaceRegex, "$1[]$2")
        .replace(simplifyGenericRegex, "&lt;");
}

function createOptions(conf: TemplateOptions): TemplateOptions {
    return {
        systemName: conf.systemName || "Documentation",
        theme: conf.theme || "default",
        navType: conf.navType || "vertical",
        inverseNav: conf.inverseNav || false,
        tableOfContents: conf.tableOfContents !== false,
        linenums: conf.linenums || false,
        collapseSymbols: conf.collapseSymbols !== false,
        footer: conf.footer || "",
        copyright: conf.copyright || "",
        syntaxTheme: conf.syntaxTheme || "default",
        outputSourceFiles: conf.outputSourceFiles === true,
        outputSourcePath: conf.outputSourcePath,
        sourceRootPath: conf.sourceRootPath,
        analytics: conf.analytics || null
    };
}

function getMembers(data: JSDoc.TaffyDB<TemplateDoclet>): TypescriptMembersResult {
    var members = <TypescriptMembersResult>helper.getMembers(data);

    members.enums = data({ kind: "typedef", isEnum: { is: true } }).get();
    members.callbacks = data({ kind: "typedef", isEnum: { "!is": true }, signature: { isUndefined: false } }).get();
    members.typedef = data({ kind: "typedef", isEnum: { "!is": true }, signature: { isUndefined: true } }).get();

    return members;
};

function addDisplayName(d: TemplateDoclet): void {
    var name = d.name;

    if (d.kind === "class") {
        name = `<span class="keyword text-primary">new</span> ${name}`;
    }
    else if (d.isConstructor) {
        name = `<span class="keyword text-primary">new</span> ${d.memberof.split(".").pop()}`;
    }
    else if (d.isCtorSignature) {
        name = `<span class="keyword text-primary">new</span>`;
    }
    else if (d.isCallSignature) {
        name = `<span class="text-hide">${name}</span>`;
    }

    d.displayname = `<span class="signature-name">${name}</span>`;
}

function kindToTitle(kind: string): string {
    return kind.substr(0, 1).toUpperCase() + kind.substr(1) + (kind.charAt(kind.length - 1) === "s" ? "es" : "s");
}

function isEntrySelected(doc: any, entry: TemplateNavSection): boolean {
    if (!doc) {
        return false;
    }

    var kind = doc.kind;

    if (kind === "globalobj" && entry.title === "Global") {
        return true;
    }

    if (kind === "sectionIndex" && doc.contents.title === entry.title) {
        return true;
    }

    if (kindToTitle(kind) === entry.title) {
        return true;
    }

    return false;
}

//#endregion

//#region Common

function find(spec: any): TemplateDoclet[] {
    return helper.find(data, spec);
}

function tutoriallink(tutorial: string): string {
    return helper.toTutorial(tutorial, null, { tag: "em", classname: "disabled", prefix: "Tutorial: " });
}

function getAncestorLinks(doclet: TemplateDoclet): string[] {
    return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet: TemplateDoclet, hash: string): string {
    if (!/^(#.+)/.test(hash)) { return hash; }

    var url = helper.createLink(doclet);

    url = url.replace(/(#.+|$)/, hash);
    return `<a href="${url}">${hash}</a>`;
}

function getPathFromDoclet(doclet: TemplateDoclet): string {
    if (!doclet.meta) {
        return;
    }

    var filepath =
        doclet.meta.path && doclet.meta.path !== "null" ?
            path.join(doclet.meta.path, doclet.meta.filename) :
            doclet.meta.filename;

    return filepath;
}

function linktoTutorial(longName: string, name: string): string {
    return tutoriallink(name);
}

function linktoExternal(longName: string, name: string): string {
    return linkto(longName, name.replace(/(^"|"$)/g, ""));
}

function shortenPaths(files: JSDoc.IDictionary<TemplateSourceFile>, commonPrefix: string) {
    // always use forward slashes
    var regexp = /\\/g;

    Object.keys(files).forEach(file => {
        files[file].shortened = files[file].resolved.replace(commonPrefix, "").replace(regexp, "/");
    });

    return files;
}

//#endregion

//#region Signatures

function needsSignature(doclet: TemplateDoclet): boolean {
    var needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === "function" || doclet.kind === "class") {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === "typedef" &&
        doclet.type &&
        doclet.type.names &&
        doclet.type.names.length) {
        for (var i = 0, l = doclet.type.names.length; i < l; i++) {
            if (doclet.type.names[i].toLowerCase() === "function") {
                needsSig = true;
                break;
            }
        }
    }

    return needsSig;
}

function addSignatureParams(f: TemplateDoclet): void {
    var generic = "";
    if (f.generic) {
        generic = `<span class="generic-signature text-muted">&lt;${htmlsafe(f.generic)}&gt;</span>`;
    }

    var params = [];
    if (f.params) {
        f.params.forEach(function (param) {
            var paramName = param.name,
                paramSignature = "any",
                result = `<span class="signature-param">${paramName}</span>`;

            if (param.type) {
                paramSignature = param.type.names.map((paramTypeName) => {
                    return formatType(linkto(paramTypeName, htmlsafe(paramTypeName)));
                }).join("|");
            }

            result += `: <span class="type-signature text-info">${paramSignature}</span>`;

            if (param.optional) {
                result = `<span class="signature-optional text-muted">${result}</span>`;
            }

            params.push(result);
        });
    }

    f.signature = (f.signature || "") + generic + "(" + params.join(", ") + ")";
}

function addSignatureReturns(f: TemplateDoclet): void {
    var returnTypes = (f.kind === "class" || f.isConstructor) ? ["void"] : helper.getSignatureReturns(f);

    f.signature = `<span class="signature">${(f.signature || "")}</span>`;

    if (returnTypes.length) {
        f.signature +=
            `<span class="type-signature">` +
                ` <span class="glyphicon glyphicon-arrow-right"></span> ` +
                `<span class="text-info">${returnTypes.map(formatType).join("|")}</span>` +
            "</span>";
    }
}

function addSignatureTypes(f: TemplateDoclet): void {
    var types = helper.getSignatureTypes(f);
    if (!types.length) {
        return;
    }

    types = types.map(formatType);

    f.signature = (f.signature || "") + `: <span class="type-signature text-info">${types.join("|")}</span>`;
}

function addAttribs(d: TemplateDoclet): void {
    var kind = d.kind,
        result = "";

    if (kind === "event") {
        result = `<span title="event" class="label label-warning"><span class="glyphicon glyphicon-flash"></span></span>`;
    }
    else if (kind === "typedef") {
        if (d.signature) {
            result = `<span title="callback" class="label label-warning"><span class="glyphicon glyphicon-arrow-right"></span></span>`;
        }
        else if (d.isEnum) {
            result = `<span title="enum" class="label label-warning">E</span>`;
        }
        else {
            result = `<span title="type" class="label label-warning">T</span>`;
        }
    }
    else if (kind === "class" || d.isConstructor) {
        result = `<span title="constructor" class="label label-danger">C</span>`;
    }
    else {
        var access = d.access || "public",
            labelClass;

        switch (access) {
            case "private":
                labelClass = "label-danger";
                break;
            case "protected":
                labelClass = "label-warning";
                break;
            case "override":
                labelClass = "label-info";
                break;
            default:
                labelClass = "label-success";
                break;
        }

        if (d.scope === "static") {
            result += `<span class="label label-default" title="static">S</span>`;
        }

        if (d.virtual) {
            result += `<span class="label label-default" title="abstract (virtual)">A</span>`;
        }

        if (kind === "function") {
            result += `<span class="label ${labelClass}" title="${access} method">M</span>`;
        }
        else if (kind === "constant") {
            result += `<span class="label ${labelClass}" title="${access} constant">C</span>`;
        }
        else {
            result += `<span class="label ${labelClass}" title="${access} property">P</span>`;
        }

        if (d.readonly && kind === "member") {
            result += `<span class="label label-default" title="read-only">R</span>`;
        }

        if (d.nullable === true) {
            result += `<span class="label label-default" title="nullable">?</span>`;
        }
        else if (d.nullable === false) {
            result += `<span class="label label-default" title="non-null">!</span>`;
        }
    }

    d.attribs =
        `<span class="type-attributes">${result}</span> `;
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets: TemplateDoclet[], modules: TemplateDoclet[]) {
    var symbols: JSDoc.IDictionary<TemplateDoclet[]> = {};

    // build a lookup table
    doclets.forEach(symbol => {
        symbols[symbol.longname] = symbols[symbol.longname] || [];
        symbols[symbol.longname].push(symbol);
    });

    return modules.map(module => {
        if (symbols[module.longname]) {
            module.modules = symbols[module.longname]
                // Only show symbols that have a description. Make an exception for classes, because
                // we want to show the constructor-signature heading no matter what.
                .filter(symbol => !!symbol.description || symbol.kind === "class")
                .map(symbol => {
                    symbol = doop(symbol);

                    if (symbol.kind === "class" || symbol.kind === "function") {
                        symbol.name = symbol.name.replace("module:", `(require("`) + `"))`;
                    }

                    return symbol;
                });
        }
    });
}

//#endregion

//#region Templates 

function generate(docType: string, title: string, docs: any[], filename: string, resolveLinks?: boolean): void {
    resolveLinks = resolveLinks !== false;

    var docData = {
        env: env,
        title: title,
        docs: docs,
        docType: docType
    };

    var outpath = path.join(outdir, filename.toString()),
        html = view.render("container.tmpl", docData);

    if (resolveLinks) {
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    fs.writeFileSync(outpath, html, "utf8");
}

function generateSourceFiles(sourceFiles: JSDoc.IDictionary<any>, encoding?: string) {
    encoding = encoding || "utf8";

    Object.keys(sourceFiles).forEach(function (file) {
        var source;
        // links are keyed to the shortened path in each doclet's `meta.filename` property
        var sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);
        helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

        try {
            source = {
                kind: "source",
                code: helper.htmlsafe(fs.readFileSync(sourceFiles[file].resolved, encoding))
            };
        }
        catch (e) {
            logger.error("Error during source file generation", e);
        }

        generate("source", "Source: " + sourceFiles[file].shortened, [source], sourceOutfile, false);
    });
}

//#endregion

//#region Navigation

function buildMemberNav(members: TypescriptMembersResult, key: string, title: string, seen: JSDoc.IDictionary<boolean>, linktoFn: (longname: string, name: string) => string): TemplateNavSection {
    var items: TemplateDoclet[] = members[key],
        results: TemplateNavMember[] = [];

    if (items && items.length) {
        items.forEach(item => {
            var itemLongName = item.longname || item.name,
                itemName = item.name || item.longname;

            if (!hasOwnProp.call(seen, itemLongName)) {
                results.push({
                    name: itemName,
                    longname: itemLongName,
                    link: linktoFn(itemLongName, itemLongName.replace(/^module:/, ""))
                });
                seen[itemLongName] = true;
            }
        });
    }

    return {
        title: title,
        link: helper.getUniqueFilename(key + ".list"),
        members: results
    };
}

/**
 * Create the navigation sidebar.
 * @param members - The members that will be used to create the sidebar.
 * @returns The HTML for the navigation sidebar.
 */
function buildNav(members: TypescriptMembersResult, options: TemplateOptions) {
    var seen: JSDoc.IDictionary<boolean> = {};
    var nav: TemplateNav = {
        index: {
            title: options.systemName,
            link: indexUrl,
            members: []
        },
        global: {
            title: "Global",
            link: globalUrl,
            members: []
        },

        module: buildMemberNav(members, "modules", "Modules", seen, linkto),
        external: buildMemberNav(members, "externals", "Externals", seen, linktoExternal),
        class: buildMemberNav(members, "classes", "Classes", seen, linkto),
        interface: buildMemberNav(members, "interfaces", "Interfaces", seen, linkto),
        event: buildMemberNav(members, "events", "Events", seen, linkto),
        typedef: buildMemberNav(members, "typedef", "Type Definitions", seen, linkto),
        enum: buildMemberNav(members, "enums", "Enums", seen, linkto),
        callback: buildMemberNav(members, "callbacks", "Callbacks", seen, linkto),
        namespace: buildMemberNav(members, "namespaces", "Namespaces", seen, linkto),
        mixin: buildMemberNav(members, "mixins", "Mixins", seen, linkto),
        tutorial: buildMemberNav(members, "tutorials", "Tutorials", {}, linktoTutorial),

        topLevel: [],
        searchMembers: null
    };

    if (members.globals.length) {
        members.globals.forEach(function (g) {
            if (g.kind !== "typedef" && !hasOwnProp.call(seen, g.longname)) {
                nav.global.members.push({
                    name: g.name,
                    longname: g.longname,
                    link: linkto(g.longname, g.longname)
                });
            }
            seen[g.longname] = true;
        });
    }

    [
        "global", "module", "external", "class", "interface", "event",
        "typedef", "enum", "callback", "namespace", "mixin", "tutorial"
    ].forEach(key => {
        var entry: TemplateNavSection = nav[key];
        if (entry.members.length > 0 && key !== "index") {
            nav.topLevel.push({
                title: entry.title,
                link: entry.link,
                members: entry.members
            });
        }
    });

    nav.searchMembers = flatten(nav.topLevel.map(entry => entry.members));
    //var searchMembers = flatten(topLevel.map(function (entry) { return entry.members; }));
    //nav.searchMembers = searchMembers.map(function (member) {
    //    return { realName: member.longname, link: member.link };
    //});

    return nav;
}

//#endregion

exports.publish = function (taffyData: JSDoc.TaffyDB<JSDoc.Doclet>, opts: any, tutorials: any): void {
    data = taffyData;

    var conf = env.conf.templates || {};
    conf.default = conf.default || {};

    var options = createOptions(conf);

    var templatePath = path.normalize(opts.template);
    view = new template.Template(templatePath + "/tmpl");

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    //var indexUrl = helper.getUniqueFilename("index");
    // don't call registerLink() on this one! "index" is also a valid longname

    //var globalUrl = helper.getUniqueFilename("global");
    helper.registerLink("global", globalUrl);

    // set up templating
    view.layout = conf.default.layoutFile ?
        path.getResourcePath(path.dirname(conf.default.layoutFile), path.basename(conf.default.layoutFile)) :
        "layout.tmpl";

    // set up tutorials for helper
    helper.setTutorials(tutorials);

    data = helper.prune(data);
    data.sort("longname, version, since");
    helper.addEventListeners(data);

    var sourceFiles: JSDoc.IDictionary<TemplateSourceFile> = {};
    var sourceFilePaths: string[] = [];
    data().each(doclet => {
        doclet.attribs = "";

        if (doclet.examples) {
            doclet.examples = doclet.examples.map(example => {
                var caption, code;

                if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
                    caption = RegExp.$1;
                    code = RegExp.$3;
                }

                return {
                    caption: caption || "",
                    code: code || example
                };
            });
        }

        if (doclet.see) {
            doclet.see.forEach((seeItem, i) => {
                doclet.see[i] = hashToLink(doclet, seeItem);
            });
        }

        // build a list of source files
        var sourcePath: string;
        var resolvedSourcePath: string;
        if (doclet.meta) {
            sourcePath = getPathFromDoclet(doclet);
            sourceFiles[sourcePath] = {
                resolved: sourcePath,
                shortened: null
            };

            if (sourceFilePaths.indexOf(sourcePath) === -1) {
                sourceFilePaths.push(sourcePath);
            }
        }
    });

    // update outdir if necessary, then create outdir
    var packageInfo = (find({ kind: "package" }) || [])[0];
    if (packageInfo && packageInfo.name) {
        outdir = path.join(outdir, packageInfo.name, packageInfo.version);
    }
    fs.mkPath(outdir);

    // copy static files to outdir
    var fromDir = path.join(templatePath, "static"),
        staticFiles = fs.ls(fromDir, 3);

    staticFiles.forEach(fileName => {
        var toDir = fs.toDir(fileName.replace(fromDir, outdir));
        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
    });

    // copy user-specified static files to outdir
    var staticFilePaths: string[];
    var staticFileFilter, staticFileScanner;
    if (conf.default.staticFiles) {
        // The canonical property name is `include`. We accept `paths` for backwards compatibility
        // with a bug in JSDoc 3.2.x.
        staticFilePaths = conf.default.staticFiles.include || conf.default.staticFiles.paths || [];
        staticFileFilter = new (require("jsdoc/src/filter")).Filter(conf.default.staticFiles);
        staticFileScanner = new (require("jsdoc/src/scanner")).Scanner();

        staticFilePaths.forEach(filePath => {
            var extraStaticFiles: string[];

            filePath = path.resolve(env.pwd, filePath);
            extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

            extraStaticFiles.forEach(fileName => {
                var sourcePath = fs.toDir(filePath);
                var toDir = fs.toDir(fileName.replace(sourcePath, outdir));
                fs.mkPath(toDir);
                fs.copyFileSync(fileName, toDir);
            });
        });
    }

    if (sourceFilePaths.length) {
        var payload = options.sourceRootPath;
        if (!payload) {
            payload = path.commonPrefix(sourceFilePaths);
        }
        sourceFiles = shortenPaths(sourceFiles, payload);
    }

    data().each(doclet => {
        var url = helper.createLink(doclet);
        helper.registerLink(doclet.longname, url);

        // replace the filename with a shortened version of the full path
        var docletPath;
        if (doclet.meta) {
            docletPath = getPathFromDoclet(doclet);
            docletPath = sourceFiles[docletPath] && sourceFiles[docletPath].shortened;
            if (docletPath) {
                doclet.meta.shortpath = docletPath;
            }
        }
    });

    data().each(doclet => {
        var url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf("#") > -1) {
            doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
        }
        else {
            doclet.id = doclet.name;
        }

        if (needsSignature(doclet)) {
            addDisplayName(doclet);
            addSignatureParams(doclet);
            addSignatureReturns(doclet);
            addAttribs(doclet);
        }
    });

    // do this after the urls have all been generated
    data().each(doclet => {
        doclet.ancestors = getAncestorLinks(doclet);

        if (doclet.kind === "member" || doclet.kind === "event") {
            addDisplayName(doclet);
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === "constant") {
            addDisplayName(doclet);
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = "member";
        }

        if (doclet.kind === "typedef") {
            addDisplayName(doclet);

            if (doclet.isEnum) {
                addSignatureTypes(doclet);
            }

            addAttribs(doclet);
        }
    });

    var members = getMembers(data);
    members.tutorials = tutorials.children;

    // output pretty-printed source files by default
    var outputSourceFiles = options.outputSourceFiles !== false && conf.default.outputSourceFiles !== false;

    // add template helpers
    view.find = find;
    view.linkto = linkto;
    view.resolveAuthorLinks = resolveAuthorLinks;
    view.tutoriallink = tutoriallink;
    view.htmlsafe = htmlsafe;
    view.outputSourceFiles = outputSourceFiles;
    view.isEntrySelected = isEntrySelected;

    // once for all
    view.nav = buildNav(members, options);
    view.options = options;
    attachModuleSymbols(find({ kind: ["class", "function"], longname: { left: "module:" } }), members.modules);

    // generate the pretty-printed source files first so other pages can link to them
    if (outputSourceFiles) {
        generateSourceFiles(sourceFiles, opts.encoding);
    }

    if (members.globals.length) {
        generate("global", "Global", [{ kind: "globalobj" }], globalUrl);
    }

    // some browsers can't make the dropdown work
    Object.keys(view.nav).forEach(function (kind) {
        if (kind === "index" || kind === "global" || kind === "topLevel" || kind === "searchMembers") {
            return;
        }

        var entry = view.nav[kind];
        generate(kind, entry.title, [{ kind: "sectionIndex", contents: entry }], entry.link);
    });

    // index page displays information from package.json and lists files
    var files = find({ kind: "file" }),
        packages = find({ kind: "package" }),
        mainPage: any = {
            kind: "mainpage",
            readme: opts.readme,
            longname: (opts.mainpagetitle) ? opts.mainpagetitle : "Main Page"
        };

    generate("index", "Index", packages.concat([mainPage]).concat(files), indexUrl);

    // set up the lists that we'll use to generate pages
    var classes = taffy(members.classes);
    var interfaces = taffy(members.interfaces);
    var modules = taffy(members.modules);
    var namespaces = taffy(members.namespaces);
    var mixins = taffy(members.mixins);
    var externals = taffy(members.externals);
    var typedefs = taffy(members.typedef);
    var callbacks = taffy(members.callbacks);
    var enums = taffy(members.enums);

    Object.keys(helper.longnameToUrl).forEach(longname => {
        var myClasses = helper.find(classes, { longname: longname });
        if (myClasses.length) {
            generate("class", "Class: " + myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
        }

        var myInterfaces = helper.find(interfaces, { longname: longname });
        if (myInterfaces.length) {
            generate("interface", "Interface: " + myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname]);
        }

        var myModules = helper.find(modules, { longname: longname });
        if (myModules.length) {
            generate("module", "Module: " + myModules[0].name, myModules, helper.longnameToUrl[longname]);
        }

        var myNamespaces = helper.find(namespaces, { longname: longname });
        if (myNamespaces.length) {
            generate("namespace", "Namespace: " + myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
        }

        var myMixins = helper.find(mixins, { longname: longname });
        if (myMixins.length) {
            generate("mixin", "Mixin: " + myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
        }

        var myExternals = helper.find(externals, { longname: longname });
        if (myExternals.length) {
            generate("external", "External: " + myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
        }
    });

    // TODO: move the tutorial functions to templateHelper.js
    function generateTutorial(title, tutorial, filename) {
        var tutorialData = {
            title: title,
            header: tutorial.title,
            content: tutorial.parse(),
            children: tutorial.children,
            docs: null
        };

        var tutorialPath = path.join(outdir, filename),
            html = view.render("tutorial.tmpl", tutorialData);

        // yes, you can use {@link} in tutorials too!
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>

        fs.writeFileSync(tutorialPath, html, "utf8");
    }

    // tutorials can have only one parent so there is no risk for loops
    function saveChildren(node) {
        node.children.forEach(function (child) {
            generateTutorial("tutorial" + child.title, child, helper.tutorialToUrl(child.name));
            saveChildren(child);
        });
    }

    saveChildren(tutorials);
};
