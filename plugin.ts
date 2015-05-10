import ast = require("./lib/ast");
import utils = require("./lib/utils");

var hasOwnProp = Object.prototype.hasOwnProperty;

export function defineTags(dictionary: JSDoc.Dictionary) {
    dictionary.defineTag("ctor", {
        mustHaveValue: false,
        canHaveType: false,
        canHaveName: false,
        onTagged: (doclet, tag) => {
            doclet.addTag("kind", "function");
            doclet.addTag("name", "constructor");
            doclet.isConstructor = true;
        }
    });

    dictionary.defineTag("callsignature", {
        mustHaveValue: false,
        canHaveType: false,
        canHaveName: false,
        onTagged: (doclet, tag) => {
            doclet.addTag("kind", "function");
            doclet.addTag("name", "call");
            doclet.isCallSignature = true;
        }
    });

    dictionary.defineTag("ctorsignature", {
        mustHaveValue: false,
        canHaveType: false,
        canHaveName: false,
        onTagged: (doclet, tag) => {
            doclet.addTag("kind", "function");
            doclet.addTag("name", "new");
            doclet.isCtorSignature = true;
        }
    });

    dictionary.defineTag("enum", {
        mustHaveValue: true,
        canHaveType: true,
        canHaveName: true,
        onTagged: (doclet: JSDoc.Doclet, tag: JSDoc.ComplexTag) => {
            doclet.addTag("kind", "typedef");
            doclet.addTag("name", tag.value.name);

            // Add the type names and other type properties (such as `optional`). 
            // Don"t overwrite existing properties. 
            if (tag.value.type) {
                Object.keys(tag.value).forEach(function (prop) {
                    if (!hasOwnProp.call(doclet, prop)) {
                        doclet[prop] = tag.value[prop];
                    }
                });
            }

            doclet.isEnum = true;
        }
    });

    dictionary.defineTag("generic", {
        mustHaveValue: true,
        canHaveType: false,
        onTagged: (doclet, tag) => {
            doclet.generic = tag.text;
        }
    });
};

export var handlers: JSDoc.Plugins.Handlers = {
    beforeParse: function (e) {
        var opts = ast.getOptionsFromConfig(env.conf.typescript),
            comments = ast.getFileComments(e.filename, opts);

        e.source = comments.toString();
    }
};
