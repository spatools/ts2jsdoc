// Type definitions for JSDoc 3.3.0-beta3
// Project: http://usejsdoc.org/
// Definitions by: Maxime LUCE <https://github.com/SomaticIT>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module JSDoc {
    export interface IDictionary<T> {
        [key: string]: T;
    }
    export interface TaffyDBResult<T> {
        get(): T[]
        each(iterator: (data: T, index: number) => void): void;
    }
    export interface TaffyDB<T> {
        (): TaffyDBResult<T>;
        (spec: any): TaffyDBResult<T>;
        sort(spec: string): void;
    }

    /** Data about the environment in which JSDoc is running, including the configuration settings that were used to run JSDoc. */
    export interface Environment {
        /** The times at which JSDoc started and finished. */
        run: {
            start: Date;
            finish: Date;
        };

        /** The command-line arguments passed to JSDoc. */
        args: any[];

        /** The data parsed from JSDoc's configuration file. */
        conf: any;

        /** The absolute path to the base directory in which JSDoc is located. Set at startup. */
        dirname: string;

        /** The user's working directory at the time when JSDoc started running. */
        pwd: string;

        /** The command- line arguments, parsed into a key/ value hash. */
        opts: any;

        /** The source files that JSDoc will parse. */
        sourceFiles: string[];

        /** The JSDoc version number and revision date. */
        version: {
            /** The JSDoc version number. */
            number: string;
            /** The JSDoc revision number, expressed as a UTC date string. */
            revision: string;
        };
    }

    export interface TagValueType {
        names: string[];
        parsedType: string;
    }

    export interface TagValue {
        name?: string;
        type?: TagValueType;
        optional?: boolean;
        nullable?: boolean;
        variable?: boolean;
        defaultvalue?: string;
        description?: string;
    }

    export interface Tag {
        originalTitle: string;
        title: string;
        text: string;
        value: string|JSDoc.TagValue;
    }
    export interface SimpleTag extends Tag {
        value: string;
    }
    export interface ComplexTag extends Tag {
        value: JSDoc.TagValue;
    }

    /** Information about the code symbol. */
    export interface DocletMetaCode {
        /** Unique identifier for the code symbol. */
        id?: string;
        /** The type of the symbol in the source code. */
        type?: string;
        /** The value of the symbol in the source code. */
        value?: any;
        /** The parameters' name of the symbol in the source code. */
        paramnames?: string[];
        node?: any;
        funcscope?: any;
    }
    export interface DocletMeta {
        /** The name of the file containing the code associated with this doclet. */
        filename?: string;
        /** The line number of the code associated with this doclet. */
        lineno?: number;
        /** The name of the directory containing the code associated with this doclet. */
        path?: string;
        /** The positions of the first and last characters of the code associated with this doclet. */
        range?: number[];
        /** Information about the code symbol. */
        code?: DocletMetaCode;
        /** Used by templates */
        shortpath?: string;
    }
    export interface DocletAbout {
        from: string;
        as: string;
    }

    export interface Doclet {
        comment: string;
        description?: string;
        meta?: DocletMeta;

        kind?: string;
        name?: string;
        longname?: string;
        memberof?: string;
        variation?: string;
        params?: TagValue[];
        borrowed?: DocletAbout[];
        mixes?: string[];
        augments?: string[];

        virtual?: boolean;
        access?: string;
        alias?: string;
        author?: string[];
        classdesc?: string;
        copyright?: string;
        defaultvalue?: string;
        defaultvaluetype?: string;
        deprecated?: boolean;
        isEnum?: boolean;
        examples?: string[];
        fires?: string[];
        scope?: string;
        ignore?: boolean;
        implements?: string[];
        inheritdoc?: string;
        license?: string;
        properties?: TagValue[];
        readonly?: boolean;
        requires?: string[];
        returns?: TagValue[];
        see?: string[];
        since?: string;
        summary?: string;
        this?: string;
        todo?: string[];
        exceptions?: string[];
        tutorials?: string[];
        type?: TagValueType;
        undocumented?: boolean;
        version?: string;
        override?: boolean;
        listens?: string[];
        nullable?: boolean;

        preserveName?: boolean;

        /** Called once after all tags have been added. */
        postProcess(): void;

        /** 
         * Add a tag to the doclet. 
         * @param title - The title of the tag being added. 
         * @param [text] - The text of the tag being added. 
         */
        addTag(title: string, text?: string): void;

        /** 
         * Set the doclet's `memberof` property. 
         * @param sid - The longname of the doclet's parent symbol. 
         */
        setMemberof(sid: string): void;

        /** 
         * Set the doclet's `longname` property.
         * @param name - The longname for the doclet. 
         */
        setLongname(name: string): void;

        /**
         * Set the doclet's `scope` property. Must correspond to a scope name that is defined in {@link module:jsdoc/name.SCOPE.NAMES}. 
         * @param scope - The scope for the doclet relative to the symbol's parent. 
         * @throws {Error} If the scope name is not recognized.
         */
        setScope(scope: string): void;

        /** 
         * Add a symbol to this doclet's `borrowed` array.
         * @param source - The longname of the symbol that is the source.
         * @param [target] - The name the symbol is being assigned to.
         */
        borrow(source: string, target?: string): void;

        /** 
         * Add a symbol to this doclet's `mixes` array.
         * @param source - The longname of the symbol that is the source.
         */
        mix(source: string): void;

        /** 
         * Add a symbol to this doclet's `augments` array.
         * @param base - The longname of the base symbol.
         */
        augment(base: string): void;

        /** Set the `meta` property of this doclet. */
        setMeta(meta: DocletMeta): void;
    }

    export interface TagDefinitionOptions {
        isNamespace?: boolean;
        mustNotHaveValue?: boolean;
        mustHaveValue?: boolean;
        canHaveType?: boolean;
        canHaveName?: boolean;
        synonyms?: string[];
        keepsWhitespace?: boolean;
        removesIndent?: boolean;

        onTagText?: (text: string) => string;
        onTagged: (doclet: Doclet, tag: Tag) => void;
    }
    export interface TagDefinition extends TagDefinitionOptions {
        title: string;
        synonym(synonymName: string): TagDefinition;
    }

    export interface Dictionary {
        defineTag(title: string, opts: TagDefinitionOptions): TagDefinition;
        defineSynonym(title: string, synonym: string): void;
        getNamespaces(): string[];
        lookUp(title: string): TagDefinition | boolean;
        isNamespace(kind: string): boolean;
        normalise(title: string): string;
        normalize(title: string): string;
    }

    export interface ScopeToPunc {
        inner: string;
        instance: string;
        static: string;
    }

    export interface Tutorial {
    }

    export module Util {
        /**
         * Logging levels for the JSDoc logger. The default logging level is
         * {@link module:jsdoc/util/logger.LEVELS.ERROR}.
         * @alias module:jsdoc/util/logger.LEVELS
         */
        export enum LogLevels {
            /** Do not log any messages. */
            SILENT = 0,
            /** 
             * Log fatal errors that prevent JSDoc from running.
             */
            FATAL = 10,
            /** 
             * Log all errors, including errors from which JSDoc can recover.
             */
            ERROR = 20,
            /** 
             * Log the following messages:
             * + Warnings 
             * + Errors 
             */
            WARN = 30,
            /** 
             * Log the following messages:
             * + Informational messages 
             * + Warnings 
             * + Errors 
             */
            INFO = 40,
            /** 
             * Log the following messages:
             * + Debugging messages 
             * + Informational messages 
             * + Warnings 
             * + Errors 
             */
            DEBUG = 50,
            /** Log all messages. */
            VERBOSE = 1000
        }

        export interface Logger extends NodeJS.EventEmitter {
            /** Logging levels for the JSDoc logger.The default logging level is */
            LEVELS: LogLevels;

            /** 
             * Log a message at log level {@link JSDoc.Util.LogLevels.DEBUG}. 
             * @param message - The message to log. 
             * @param values - The values that will replace the message's placeholders. 
             */
            debug(message: string, ...args: any[]): void;

            /** 
             * Log a message at log level {@link JSDoc.Util.LogLevels.DEBUG}. 
             * The string is not terminated by a newline.
             * @param message - The message to log. 
             * @param values - The values that will replace the message's placeholders. 
             */
            printDebug(message: string, ...args: any[]): void;

            /** 
             * Log a message at log level {@link module:jsdoc/util/logger.LEVELS.ERROR}.
             * @param message - The message to log. 
             * @param values - The values that will replace the message's placeholders. 
             */
            error(message: string, ...args: any[]): void;

            /** 
             * Log a message at log level {@link module:jsdoc/util/logger.LEVELS.FATAL}. 
             * @param message - The message to log. 
             * @param values - The values that will replace the message's placeholders. 
             */
            fatal(message: string, ...args: any[]): void;

            /** 
             * Log a message at log level {@link module:jsdoc/util/logger.LEVELS.INFO}. 
             * @param message - The message to log. 
             * @param values - The values that will replace the message's placeholders. 
             */
            info(message: string, ...args: any[]): void;

            /** 
             * Log a message at log level {@link module:jsdoc/util/logger.LEVELS.INFO}. 
             * The string is not terminated by a newline.
             * @param message - The message to log. 
             * @param values - The values that will replace the message's placeholders. 
             */
            printInfo(message: string, ...args: any[]): void;

            /** 
             * Log a message at log level {@link module:jsdoc/util/logger.LEVELS.VERBOSE}. 
             * @param message - The message to log. 
             * @param values - The values that will replace the message's placeholders. 
             */
            verbose(message: string, ...args: any[]): void;

            /** 
             * Log a message at log level {@link module:jsdoc/util/logger.LEVELS.VERBOSE}. 
             * The string is not terminated by a newline.
             * @param message - The message to log. 
             * @param values - The values that will replace the message's placeholders. 
             */
            printVerbose(message: string, ...args: any[]): void;

            /** 
             * Set the log level.
             * @param level - The log level to use.
             */
            setLevel(level: LogLevels): void;
            /** 
             * Get the current log level.
             * @returns The current log level.
             */
            getLevel(): LogLevels;
        }
    }

    export module Plugins {
        export interface ParseBeginEventArgs {
            /** An array of paths to source files that will be parsed. */
            sourcefiles: string[];
        }
        export interface FileBeginEventArgs {
            /** The name of the file. */
            filename: string;
        }
        export interface BeforeParseEventArgs {
            /** The name of the file. */
            filename: string;
            /** The contents of the file. */
            source: string;
        }
        export interface JSDocCommentFoundEventArgs {
            /** The name of the file. */
            filename: string;
            /** The text of the JSDoc comment. */
            comment: string;
            /** The line number on which the comment was found. */
            lineno: number;
        }
        export interface SymbolFoundEventArgs {
            /** The name of the file. */
            filename: string;
            /** The text of the JSDoc comment associated with the symbol, if any. */
            comment: string;
            /** The unique ID of the symbol. */
            id: string;
            /** The line number on which the symbol was found. */
            lineno: number;
            /** An array containing the numeric index of the first and last characters in the source file that are associated with the symbol. */
            range: number[];
            /** The symbol's node from the abstract syntax tree. */
            astnode: any;
            /** Object with detailed information about the code. */
            code: DocletMetaCode;
        }
        export interface NewDocletEventArgs {
            /** The new doclet that was created. */
            doclet: Doclet;
        }
        export interface FileCompleteEventArgs {
            /** The name of the file. */
            filename: string;
            /** The contents of the file. */
            source: string;
        }
        export interface ParseCompleteEventArgs {
            /** An array of paths to source files that will be parsed. */
            sourcefiles: string[];
            /** An array of doclet objects. */
            doclets: Doclet[];
        }
        export interface ProcessingCompleteEventArgs {
            /** An array of doclet objects. */
            doclets: Doclet[];
        }

        export interface Handlers {
            /** 
             * The parseBegin event is fired before JSDoc starts loading and parsing the source files.
             * Your plugin can control which files JSDoc will parse by modifying the event's contents.
             * Note: This event is fired in JSDoc 3.2 and later.
             */
            parseBegin?: (e: ParseBeginEventArgs) => void;

            /** 
             * The fileBegin event is fired when the parser is about to parse a file. 
             * Your plugin can use this event to trigger per-file initialization if necessary.
             */
            fileBegin?: (e: FileBeginEventArgs) => void;

            /** 
             * The beforeParse event is fired before parsing has begun. 
             * Plugins can use this method to modify the source code that will be parsed. 
             *  For instance, your plugin could add a JSDoc comment, or it could remove preprocessing tags that are not valid JavaScript.
             */
            beforeParse?: (e: BeforeParseEventArgs) => void;

            /** 
             * The jsdocCommentFound event is fired whenever a JSDoc comment is found. 
             * The comment may or may not be associated with any code.
             * You might use this event to modify the contents of a comment before it is processed.
             */
            jsdocCommentFound?: (e: JSDocCommentFoundEventArgs) => void;

            /** 
             * The symbolFound event is fired when the parser comes across a symbol in the code that may need to be documented.
             * For example, the parser fires a symbolFound event for each variable, function, and object literal in a source file.
             */
            symbolFound?: (e: SymbolFoundEventArgs) => void;

            /** 
             * The newDoclet event is the highest-level event. It is fired when a new doclet has been created. 
             * This means that a JSDoc comment or a symbol has been processed, and the actual doclet that will be passed to the template has been created.
             */
            newDoclet?: (e: NewDocletEventArgs) => void;

            /** 
             * The fileComplete event is fired when the parser has finished parsing a file.
             * Your plugin could use this event to trigger per-file cleanup.
             */
            fileComplete?: (e: FileCompleteEventArgs) => void;

            /** 
             * The parseComplete event is fired after JSDoc has parsed all of the specified source files.
             * Note: This event is fired in JSDoc 3.2 and later.
             */
            parseComplete?: (e: ParseCompleteEventArgs) => void;

            /** 
             * The processingComplete event is fired after JSDoc updates the parse results to reflect inherited and borrowed symbols.
             * Note: This event is fired in JSDoc 3.2.1 and later.
             */
            processingComplete?: (e: ProcessingCompleteEventArgs) => void;
        }
    }
}

/** Data about the environment in which JSDoc is running, including the configuration settings that were used to run JSDoc. */
declare var env: JSDoc.Environment;

/** Functionality related to JSDoc tags. */
declare module "jsdoc/tag" {
    /**
     * @classdesc Represents a single doclet tag.
     */
    export class Tag implements JSDoc.Tag {
        originalTitle: string;
        title: string;
        text: string;
        value: string|JSDoc.TagValue;

        /** Constructs a new tag object. Calls the tag validator. */
        constructor(tagTitle: string, tagBody?: string, meta?: JSDoc.DocletMeta);
    }
}

declare module "jsdoc/doclet" {
    /**
     * @classdesc Represents a single JSDoc comment.
     */
    export class Doclet implements JSDoc.Doclet {
        comment: string;
        description: string;
        meta: JSDoc.DocletMeta;

        kind: string;
        name: string;
        longname: string;
        memberof: string;
        variation: string;
        params: JSDoc.TagValue[];
        borrowed: JSDoc.DocletAbout[];
        mixes: string[];
        augments: string[];

        virtual: boolean;
        access: string;
        alias: string;
        author: string[];
        classdesc: string;
        copyright: string;
        defaultvalue: string;
        defaultvaluetype: string;
        deprecated: boolean;
        isEnum: boolean;
        examples: string[];
        fires: string[];
        scope: string;
        ignore: boolean;
        implements: string[];
        inheritdoc: string;
        license: string;
        properties: JSDoc.TagValue[];
        readonly: boolean;
        requires: string[];
        returns: JSDoc.TagValue[];
        see: string[];
        since: string;
        summary: string;
        this: string;
        todo: string[];
        exceptions: string[];
        tutorials: string[];
        type: JSDoc.TagValueType;
        undocumented: boolean;
        version: string;
        override: boolean;
        listens: string[];
        nullable: boolean;

        preserveName: boolean;

        /**
         * @param docletSrc - The raw source code of the jsdoc comment.
         * @param meta - Properties describing the code related to this comment.
         */
        constructor(docletSrc: string, meta?: JSDoc.DocletMeta);

        /** Called once after all tags have been added. */
        postProcess(): void;

        /** 
         * Add a tag to the doclet. 
         * @param title - The title of the tag being added. 
         * @param [text] - The text of the tag being added. 
         */
        addTag(title: string, text?: string): void;

        /** 
         * Set the doclet's `memberof` property. 
         * @param sid - The longname of the doclet's parent symbol. 
         */
        setMemberof(sid: string): void;

        /** 
         * Set the doclet's `longname` property.
         * @param name - The longname for the doclet. 
         */
        setLongname(name: string): void;

        /**
         * Set the doclet's `scope` property. Must correspond to a scope name that is defined in {@link module:jsdoc/name.SCOPE.NAMES}. 
         * @param scope - The scope for the doclet relative to the symbol's parent. 
         * @throws {Error} If the scope name is not recognized.
         */
        setScope(scope: string): void;

        /** 
         * Add a symbol to this doclet's `borrowed` array.
         * @param source - The longname of the symbol that is the source.
         * @param [target] - The name the symbol is being assigned to.
         */
        borrow(source: string, target?: string): void;

        /** 
         * Add a symbol to this doclet's `mixes` array.
         * @param source - The longname of the symbol that is the source.
         */
        mix(source: string): void;

        /** 
         * Add a symbol to this doclet's `augments` array.
         * @param base - The longname of the base symbol.
         */
        augment(base: string): void;

        /** Set the `meta` property of this doclet. */
        setMeta(meta: JSDoc.DocletMeta): void;
    }
}

declare module "jsdoc/tag/dictionary" {
    var dictionary: JSDoc.Dictionary;
    export = dictionary;
}

/** Wrapper for underscore's template utility to allow loading templates from files. */
declare module "jsdoc/template" {
    export interface TemplateFunction {
        (arg: any): string;
    }

    /** 
     * @classdesc Underscore template helper. 
     */
    export class Template {
        path: string;
        layout: string;
        cache: any;

        settings: {
            evaluate: RegExp;
            interpolate: RegExp;
            escape: RegExp;
        };

        /**
         * @param filepath - Templates directory. 
         */
        constructor(filePath: string);

        /**
         * Loads template from given file.
         * @param file - Template filename.
         * @returns Returns template closure.
         */
        load(file: string): TemplateFunction;

        /** 
         * Renders template using given data. 
         * This is low-level function, for rendering full templates use {@link Template.render()}. 
         *
         * @param file - Template filename. 
         * @param data - Template variables (doesn't have to be object, but passing variables dictionary is best way and most common use). 
         * @returns Rendered template. 
         */
        partial(file: string, data?: any): string;

        /** 
         * Renders template using given data. 
         * This method automaticaly applies layout if set.
         *
         * @param file - Template filename. 
         * @param data - Template variables (doesn't have to be object, but passing variables dictionary is best way and most common use). 
         * @returns Rendered template. 
         */
        render(file: string, data?: any): string;
    }
}

/** Data about the environment in which JSDoc is running, including the configuration settings that were used to run JSDoc. */
declare module "jsdoc/env" {
    var env: JSDoc.Environment;
    export = env;
}

/** Extended version of the standard `fs` module. */
declare module "jsdoc/fs" {
    import fs = require("fs");

    export function ls(dir: string, recurse?: number): string[];
    export function toDir(path: string): string;
    export function mkPath(path: string|string[]): string;
    export function copyFileSync(inFile: string, outDir: string, fileName?: string): void;

    export var appendFile: typeof fs.appendFile;
    export var chmod: typeof fs.chmod;
    export var chown: typeof fs.chown;
    export var close: typeof fs.close;
    export var createReadStream: typeof fs.createReadStream;
    export var createWriteStream: typeof fs.createWriteStream;
    export var exists: typeof fs.exists;
    export var fchmod: typeof fs.fchmod;
    export var fchown: typeof fs.fchown;
    export var fstat: typeof fs.fstat;
    export var fsync: typeof fs.fsync;
    export var ftruncate: typeof fs.ftruncate;
    export var futimes: typeof fs.futimes;
    export var lchmod: typeof fs.lchmod;
    export var lchown: typeof fs.lchown;
    export var link: typeof fs.link;
    export var lstat: typeof fs.lstat;
    export var mkdir: typeof fs.mkdir;
    export var open: typeof fs.open;
    export var read: typeof fs.read;
    export var readdir: typeof fs.readdir;
    export var readFile: typeof fs.readFile;
    export var readlink: typeof fs.readlink;
    export var realpath: typeof fs.realpath;
    export var rename: typeof fs.rename;
    export var rmdir: typeof fs.rmdir;
    export var stat: typeof fs.stat;
    export var symlink: typeof fs.symlink;
    export var truncate: typeof fs.truncate;
    export var unlink: typeof fs.unlink;
    export var unwatchFile: typeof fs.unwatchFile;
    export var utimes: typeof fs.utimes;
    export var watch: typeof fs.watch;
    export var watchFile: typeof fs.watchFile;
    export var write: typeof fs.write;
    export var writeFile: typeof fs.writeFile;

    export var appendFileSync: typeof fs.appendFileSync;
    export var chmodSync: typeof fs.chmodSync;
    export var chownSync: typeof fs.chownSync;
    export var closeSync: typeof fs.closeSync;
    export var existsSync: typeof fs.existsSync;
    export var fchmodSync: typeof fs.fchmodSync;
    export var fchownSync: typeof fs.fchownSync;
    export var fstatSync: typeof fs.fstatSync;
    export var fsyncSync: typeof fs.fsyncSync;
    export var ftruncateSync: typeof fs.ftruncateSync;
    export var futimesSync: typeof fs.futimesSync;
    export var lchmodSync: typeof fs.lchmodSync;
    export var lchownSync: typeof fs.lchownSync;
    export var linkSync: typeof fs.linkSync;
    export var lstatSync: typeof fs.lstatSync;
    export var mkdirSync: typeof fs.mkdirSync;
    export var openSync: typeof fs.openSync;
    export var readSync: typeof fs.readSync;
    export var readdirSync: typeof fs.readdirSync;
    export var readFileSync: typeof fs.readFileSync;
    export var readlinkSync: typeof fs.readlinkSync;
    export var realpathSync: typeof fs.realpathSync;
    export var renameSync: typeof fs.renameSync;
    export var rmdirSync: typeof fs.rmdirSync;
    export var statSync: typeof fs.statSync;
    export var symlinkSync: typeof fs.symlinkSync;
    export var truncateSync: typeof fs.truncateSync;
    export var unlinkSync: typeof fs.unlinkSync;
    export var utimesSync: typeof fs.utimesSync;
    export var writeSync: typeof fs.writeSync;
    export var writeFileSync: typeof fs.writeFileSync;
}

/** Extended version of the standard `path` module. */
declare module "jsdoc/path" {
    import path = require("path");

    /**
     * Find the common prefix for an array of paths. If there is a common prefix, a trailing separator
     * is appended to the prefix. Relative paths are resolved relative to the current working directory.
     *
     * For example, assuming that the current working directory is `/Users/jsdoc`:
     *
     * + For the single path `foo/bar/baz/qux.js`, the common prefix is `foo/bar/baz/`.
     * + For paths `foo/bar/baz/qux.js`, `foo/bar/baz/quux.js`, and `foo/bar/baz.js`, the common prefix
     * is `/Users/jsdoc/foo/bar/`.
     * + For paths `../jsdoc/foo/bar/baz/qux/quux/test.js`, `/Users/jsdoc/foo/bar/bazzy.js`, and
     * `../../Users/jsdoc/foo/bar/foobar.js`, the common prefix is `/Users/jsdoc/foo/bar/`.
     * + For paths `foo/bar/baz/qux.js` and `../../Library/foo/bar/baz.js`, there is no common prefix,
     * and an empty string is returned.
     *
     * @param paths - The paths to search for a common prefix.
     * @return The common prefix, or an empty string if there is no common prefix.
     */
    export function commonPrefix(paths: string[]): string;

    /**
     * Retrieve the fully qualified path to the requested resource.
     *
     * If the resource path is specified as a relative path, JSDoc searches for the path in the
     * directory where the JSDoc configuration file is located, then in the current working directory,
     * and finally in the JSDoc directory.
     *
     * If the resource path is specified as a fully qualified path, JSDoc uses the path as-is.
     *
     * @param filepath - The path to the requested resource. May be an absolute path; a path
     * relative to the JSDoc directory; or a path relative to the current working directory.
     * @param [filename] - The filename of the requested resource.
     * @return The fully qualified path (or, on Rhino, a URI) to the requested resource.
     * Includes the filename if one was provided.
     */
    export function getResourcePath(filePath: string, fileName?: string): string;

    export var basename: typeof path.basename;
    export var delimiter: typeof path.delimiter;
    export var dirname: typeof path.dirname;
    export var extname: typeof path.extname;
    export var format: typeof path.format;
    export var isAbsolute: typeof path.isAbsolute;
    export var join: typeof path.join;
    export var normalize: typeof path.normalize;
    export var parse: typeof path.parse;
    export var posix: typeof path.posix;
    export var relative: typeof path.relative;
    export var resolve: typeof path.resolve;
    export var sep: typeof path.sep;
    export var win32: typeof path.win32;
}

/** A collection of functions relating to JSDoc symbol name manipulation. */
declare module "jsdoc/name" {
    export interface NameParts { 
        longname: string; 
        memberof: string;
        scope: string;
        name: string;
        variation: string;
    } 

    /** Longnames that have a special meaning in JSDoc. */
    export var LONGNAMES: {
        /** Longname used for doclets that do not have a longname, such as anonymous functions. */
        ANONYMOUS: string;
        /** Longname that represents global scope. */
        GLOBAL: string;
    };

    /** Names and punctuation marks that identify doclet scopes. */
    export var SCOPE: {
        NAMES: {
            GLOBAL: string;
            INNER: string;
            INSTANCE: string;
            STATIC: string;
        };
        PUNC: {
            INNER: string;
            INSTANCE: string;
            STATIC: string;
        };
    };

    export var scopeToPunc: {
        inner: string;
        instance: string;
        static: string;
    };

    export var puncToScope: {
        "~": string;
        "#": string;
        ".": string;
    };

    /**
     * Resolves the longname, memberof, variation and name values of the given doclet.
     * @param doclet - The doclet to resolve longname for.
     */
    export function resolve(doclet: JSDoc.Doclet): void;

    /**
     * Adds namespace to given name.
     * @param longname - The full longname of the symbol.
     * @param ns - The namespace to be applied.
     * @returns The longname with the namespace applied.
     */
    export function applyNamespace(longname: string, ns: string): string;

    /**
     * Removes namespace from given name.
     * @param longname - The full longname of the symbol.
     * @returns The longname without namespace.
     */
    export function stripNamespace(longname: string): string;

    /** 
     * Check whether a parent longname is an ancestor of a child longname. 
     * @param parent - The parent longname. 
     * @param child - The child longname. 
     * @returns `true` if the parent is an ancestor of the child; otherwise, `false`. 
     */ 
    export function hasAncestors(parent: string, child: string): boolean;

    /** 
     * Given a longname like "a.b#c(2)", slice it up into an object 
     * containing the memberof, the scope, the name, and variation. 
     * @returns Representing the properties of the given name. 
     */ 
    export function shorten(longname: string, forcedMemberof?: string): NameParts;

    export function combine(parts: NameParts): string;

    export function stripVariation(name: string): string;

    export function longnamesToTree(longnames: string[], doclets: JSDoc.Doclet[]): any;

    /** 
     * Split a string that starts with a name and ends with a description into its parts. 
     * @returns Hash with "name" and "description" properties. 
     */ 
    export function splitName(nameDesc: string): { name: string; description: string; };
}

/** 
 * Logging tools for JSDoc. 
 * 
 * Log messages are printed to the console based on the current logging level. By default, messages 
 * at level `{@link module:jsdoc/util/logger.LEVELS.ERROR}` or above are logged; all other messages 
 * are ignored. 
 * 
 * In addition, the module object emits an event whenever a logger method is called, regardless of 
 * the current logging level. The event's name is the string `logger:` followed by the logger's name 
 * (for example, `logger:error`). The event handler receives an array of arguments that were passed 
 * to the logger method. 
 * 
 * Each logger method accepts a `message` parameter that may contain zero or more placeholders. Each 
 * placeholder is replaced by the corresponding argument following the message. If the placeholder 
 * does not have a corresponding argument, the placeholder is not replaced. 
 * 
 * The following placeholders are supported: 
 * 
 * + `%s`: String. 
 * + `%d`: Number. 
 * + `%j`: JSON. 
 * 
 * @extends module:events.EventEmitter 
 * @example 
 * var logger = require('jsdoc/util/logger'); 
 * 
 * var data = { 
 *   foo: 'bar' 
 * }; 
 * var name = 'baz'; 
 * 
 * logger.warn('%j %s', data, name);  // prints '{"foo":"bar"} baz' 
 * @see http://nodejs.org/api/util.html#util_util_format_format 
 */
declare module "jsdoc/util/logger" {
    var logger: JSDoc.Util.Logger;
    export = logger;
}

declare module "jsdoc/util/templateHelper" {
    export interface ToTutorialOptions {
        /** The CSS class to wrap around the tutorial name. */
        classname: string;
        /** The prefix to add to the tutorial name.  */
        prefix: string;
        /** The tag to wrap around the tutorial name. */
        tag: string;
    }
    export interface GetMembersResult {
        classes: JSDoc.Doclet[];
        externals: JSDoc.Doclet[];
        globals: JSDoc.Doclet[];
        mixins: JSDoc.Doclet[];
        modules: JSDoc.Doclet[];
        events: JSDoc.Doclet[];
        namespaces: JSDoc.Doclet[];
    }

    export var globalName: string;
    export var fileExtension: string;
    export var scopeToPunc: JSDoc.ScopeToPunc;

    export var longnameToUrl: JSDoc.IDictionary<string>;
    export var longnameToId: JSDoc.IDictionary<string>;

    /** 
     * Sets tutorials map.
     * @param root - Root tutorial node.
     */
    export function setTutorials(root: JSDoc.Tutorial): void;

    export function registerLink(longname: string, url: string): void;
    export function registerId(longname: string, fragment: string): void;

    /** 
     * Convert a string to a unique filename, including an extension. 
     * 
     * Filenames are cached to ensure that they are used only once. For example, if the same string is 
     * passed in twice, two different filenames will be returned. 
     * 
     * Also, filenames are not considered unique if they are capitalized differently but are otherwise 
     * identical. 
     * @param str The string to convert. 
     * @returns The filename to use for the string. 
     */ 
    export function getUniqueFilename(str: string): string;

    /** 
     * Convert a doclet to an identifier that is unique for a specified filename. 
     * 
     * Identifiers are not considered unique if they are capitalized differently but are otherwise 
     * identical. 
     * 
     * @param filename - The file in which the identifier will be used. 
     * @param doclet - The doclet to convert. 
     * @returns A unique identifier based on the file and doclet. 
     */ 
    export function getUniqueId(longname: string, doclet: string): string;

    export function htmlsafe(str: string): string;

    /** 
     * Retrieve an HTML link to the symbol with the specified longname. If the longname is not 
     * associated with a URL, this method simply returns the link text, if provided, or the longname. 
     * 
     * The `longname` parameter can also contain a URL rather than a symbol's longname. 
     * 
     * This method supports type applications that can contain one or more types, such as 
     * `Array.<MyClass>` or `Array.<(MyClass|YourClass)>`. In these examples, the method attempts to 
     * replace `Array`, `MyClass`, and `YourClass` with links to the appropriate types. The link text 
     * is ignored for type applications. 
     * 
     * @param longname - The longname (or URL) that is the target of the link. 
     * @param linkText - The text to display for the link, or `longname` if no text is provided. 
     * @param cssClass - The CSS class (or classes) to include in the link's `<a>` tag. 
     * @param fragmentId - The fragment identifier (for example, `name` in `foo.html#name`) to append to the link target. 
     * @return The HTML link, or a plain-text string if the link is not available. 
     */ 
    export function linkto(longname: string, linkText?: string, cssClass?: string, fragmentId?: string): string;

    export function tutorialToUrl(tutorial: string): string;

    /** 
     * Retrieve a link to a tutorial, or the name of the tutorial if the tutorial is missing. If the 
     * `missingOpts` parameter is supplied, the names of missing tutorials will be prefixed by the 
     * specified text and wrapped in the specified HTML tag and CSS class. 
     * 
     * @todo Deprecate missingOpts once we have a better error-reporting mechanism. 
     * @param tutorial The name of the tutorial. 
     * @param content The link text to use. 
     * @param [missingOpts] Options for displaying the name of a missing tutorial. 
     * @returns An HTML link to the tutorial, or the name of the tutorial with the specified options. 
     */ 
    export function toTutorial(tutorial: string, content: string, missingOpts?: ToTutorialOptions): string;

    /** Find symbol {@link ...} and {@tutorial ...} strings in text and turn into html links */
    export function resolveLinks(str: string): string;

    /** Convert tag text like "Jane Doe <jdoe@example.org>" into a mailto link */
    export function resolveAuthorLinks(str: string): string;

    /**
     * Find items in a TaffyDB database that match the specified key-value pairs.
     * @param data The TaffyDB database to search.
     * @param spec Key-value pairs to match against (for example, `{ longname: 'foo' }`), or a function that returns `true` if a value matches or `false` if it
     * does not match.
     * @returns The matching items.
     */
    export function find(data: JSDoc.TaffyDB<JSDoc.Doclet>, spec: any): JSDoc.Doclet[];

    /**
     * Retrieve all of the following types of members from a set of doclets:
     * + Classes
     * + Externals
     * + Globals
     * + Mixins
     * + Modules
     * + Namespaces
     * + Events
     * @param data The TaffyDB database to search.
     */
    export function getMembers(data: JSDoc.TaffyDB<JSDoc.Doclet>): GetMembersResult;

    /**
     * Retrieve the member attributes for a doclet (for example, `virtual`, `static`, and `readonly`).
     * @param d - The doclet whose attributes will be retrieved.
     * @returns The member attributes for the doclet.
     */
    export function getAttribs(d: JSDoc.Doclet): string[];

    /**
     * Retrieve links to allowed types for the member.
     * @param d - The doclet whose types will be retrieved.
     * @param [cssClass] - The CSS class to include in the `class` attribute for each link.
     * @returns HTML links to allowed types for the member.
     */
    export function getSignatureTypes(d: JSDoc.Doclet, cssClass?: string): string[];

    /**
     * Retrieve names of the parameters that the member accepts. If a value is provided for `optClass`,
     * the names of optional parameters will be wrapped in a `<span>` tag with that class.
     * @param d - The doclet whose parameter will be retrieved.
     * @param [optClass] - The class to assign to the `<span>` tag that is wrapped around the
     * names of optional parameters. If a value is not provided, optional parameter names will not be
     * wrapped with a `<span>` tag. Must be a legal value for a CSS class name.
     * @returns An array of parameter names, with or without `<span>` tags wrapping the
     * names of optional parameters
     */
    export function getSignatureParams(d: JSDoc.Doclet, optClass?: string): string[];

    /**
     * Retrieve links to types that the member can return.
     * @param d - The doclet whose types will be retrieved.
     * @param [cssClass] - The CSS class to include in the `class` attribute for each link.
     * @returns HTML links to types that the member can return.
     */
    export function getSignatureReturns(d: JSDoc.Doclet, cssClass?: string): string[];

    /**
     * Retrieve an ordered list of doclets for a symbol's ancestors.
     *
     * @param data - The TaffyDB database to search.
     * @param doclet - The doclet whose ancestors will be retrieved.
     * @returns An array of ancestor doclets, sorted from most to least distant.
     */
    export function getAncestors(data: JSDoc.TaffyDB<JSDoc.Doclet>, doclet: JSDoc.Doclet): JSDoc.Doclet[];

    /**
     * Retrieve links to a member's ancestors.
     *
     * @param data - The TaffyDB database to search.
     * @param doclet - The doclet whose ancestors will be retrieved.
     * @param [cssClass] - The CSS class to include in the `class` attribute for each link.
     * @returns HTML links to a member's ancestors.
     */
    export function getAncestorLinks(data: JSDoc.TaffyDB<JSDoc.Doclet>, doclet: JSDoc.Doclet, cssClass?: string): string[];

    /**
     * Iterates through all the doclets in `data`, ensuring that if a method
     * @listens to an event, then that event has a 'listeners' array with the
     * longname of the listener in it.
     *
     * @param data - The TaffyDB database to search.
     */
    export function addEventListeners(data: JSDoc.TaffyDB<JSDoc.Doclet>): void;

    /**
     * Remove members that will not be included in the output, including:
     * + Undocumented members.
     * + Members tagged `@ignore`.
     * + Members of anonymous classes.
     * + Members tagged `@private`, unless the `private` option is enabled.
     * + Members tagged with anything other than specified by the `access` options.
     *
     * @param data The TaffyDB database to prune.
     * @returns The pruned database.
     */
    export function prune(data: JSDoc.TaffyDB<JSDoc.Doclet>): JSDoc.TaffyDB<JSDoc.Doclet>;

    /**
     * Create a URL that points to the generated documentation for the doclet.
     *
     * If a doclet corresponds to an output file (for example, if the doclet represents a class), the
     * URL will consist of a filename.
     *
     * If a doclet corresponds to a smaller portion of an output file (for example, if the doclet
     * represents a method), the URL will consist of a filename and a fragment ID.
     *
     * @param doclet - The doclet that will be used to create the URL.
     * @returns The URL to the generated documentation for the doclet.
     */
    export function createLink(doclet: JSDoc.Doclet): string;

    export function longnamesToTree(longnames: string[], doclets: JSDoc.Doclet[]): any;
}

declare module "jsdoc/util/doop" {
    function doop<T>(o: T): T;
    export = doop;
}
