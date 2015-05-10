import ts = require("typescript");
import typehelper = require("./typehelper");
import utils = require("./utils");
import jsdoc = require("./jsdoc");

//#region Private Method

function addTypeToTag(comments: jsdoc.Comments, tag: jsdoc.Tag, node: utils.NodeWithType, checker: ts.TypeChecker, type?: ts.Type) {
    var nodeType = <ts.TypeNode>node.type;
    if (!nodeType && !type) {
        tag.type = "*";
        return;
    }

    var typeName = typehelper.getNodeTypeName(node, nodeType, checker, type);
    typeName.anonymous.forEach((subNode: ts.FunctionOrConstructorTypeNode) => { // For completions
        var comm = comments.addLinked(),
            tagName = utils.getAnonymousName(node);

        addParent(comm, node, checker);

        if (subNode.parameters) {
            var signature = checker.getSignatureFromDeclaration(subNode);

            comm.addTag("callback", tagName);
            addFromSignature(comm, subNode, signature, checker);
        }
        else {
            comm.addTag("typedef", tagName).type = "Object";
        }
    });

    if (node.kind === ts.SyntaxKind.Parameter && (<ts.ParameterDeclaration>node).dotDotDotToken) {
        typeName.name = utils.formatType("..." + typeName.name);
    }

    tag.type = typeName.name;
}

function addParam(comments: jsdoc.Comments, param: ts.Symbol, checker: ts.TypeChecker) {
    var paramDeclaration = <ts.ParameterDeclaration>param.valueDeclaration,

        paramName = utils.formatParam(param.name, paramDeclaration),
        paramDesc = utils.getComments(param),

        tag = comments.getParamTag(param.name, paramDeclaration);

    tag.name = paramName;
    addTypeToTag(comments, tag, paramDeclaration, checker);

    if (paramDesc && paramDesc !== tag.desc) {
        tag.desc = paramDesc;
    }
}

//#endregion

//#region Generic Methods

export function addName(comments: jsdoc.Comments, tagName: string, node: utils.NodeWithName, checker?: ts.TypeChecker): void {
    var tag = comments.getOrAddTag(tagName),
        nodeType = (<ts.VariableDeclaration>node).type,
        initializer = (<ts.VariableDeclaration>node).initializer;

    tag.name = utils.getNodeName(node);

    if (checker) {
        if (nodeType) {
            addTypeToTag(comments, tag, <utils.NodeWithType><any>node, checker);
        }

        if (initializer && initializer.kind === ts.SyntaxKind.FirstLiteralToken) {
            if (tagName === "member") {
                comments.getOrAddTag("default").name = initializer.getText();
            }
            else {
                tag.name += "=" + initializer.getText();
            }
        }

        if (initializer && !nodeType) {
            addTypeToTag(comments, tag, null, checker, initializer.contextualType);
        }
    }
}

export function addGeneric(comments: jsdoc.Comments, node: utils.NodeWithTypeParameters): void {
    var params = node.typeParameters;

    if (params && params.length > 0) {
        var tag = comments.getOrAddTag("generic");
        tag.name = params.map(t => utils.getNodeName(t)).join(", ");
    }
}

export function addParent(comments: jsdoc.Comments, node: ts.Node, checker: ts.TypeChecker): void {
    if (!node.parent) {
        return;
    }

    var parentName = utils.getParentName(node, checker);

    if (parentName) {
        var tag = comments.getOrAddTag("memberof");
        tag.name = parentName;
    }
}

export function addModifier(comments: jsdoc.Comments, node: ts.Node): void {
    var isInterface = node.parent && node.parent.kind === ts.SyntaxKind.InterfaceDeclaration;

    if (!isInterface && node.modifiers) {
        if ((node.modifiers.flags & ts.NodeFlags.Public) === ts.NodeFlags.Public) {
            comments.getOrAddTag("public");
        }
        else if ((node.modifiers.flags & ts.NodeFlags.Private) === ts.NodeFlags.Private) {
            comments.getOrAddTag("private");
        }
        else if ((node.modifiers.flags & ts.NodeFlags.Protected) === ts.NodeFlags.Protected) {
            comments.getOrAddTag("protected");
        }

        if ((node.modifiers.flags & ts.NodeFlags.Static) === ts.NodeFlags.Static) {
            comments.getOrAddTag("static");
        }
    }

    if (node.parent && (node.parent.kind === ts.SyntaxKind.ClassDeclaration || node.parent.kind === ts.SyntaxKind.InterfaceDeclaration)) {
        comments.getOrAddTag("instance");
    }
}

export function addDefault(comments: jsdoc.Comments, node: utils.NodeWithInitializer): void {
    var defaultValue = utils.getDefault(node);
    if (defaultValue) {
        comments.getOrAddTag("default").name = defaultValue;
    }
}

export function addVariation(comments: jsdoc.Comments, node: ts.Node, checker: ts.TypeChecker, merge?: boolean): void {
    var typeName = utils.getParentName(node, checker),
        nodeName = utils.getNodeName(node) || typeName,
        prevComments: jsdoc.Comments,
        cache = comments.list.cache.variations;

    typeName = typeName ? typeName + "." + nodeName : nodeName;

    if (!cache) {
        cache = comments.list.cache.variations = Object.create(null);
    }

    if (merge) {
        if (typeof cache[typeName] === "undefined") {
            cache[typeName] = comments;
        }
        else {
            prevComments = cache[typeName];
            comments.mergeTo(prevComments);
            comments.clean();
        }
    }
    else {
        if (typeof cache[typeName] === "undefined") {
            cache[typeName] = 1;
        }
        else {
            cache[typeName]++;
            comments.getOrAddTag("variation").name = cache[typeName];
        }
    }
}

//#endregion

//#region Specialized Methods

export function addFromSignature(comments: jsdoc.Comments, node: ts.SignatureDeclaration, signature: ts.Signature, checker: ts.TypeChecker): void {
    var params = signature.getParameters(),
        returns = signature.getReturnType(),
        comms = utils.getComments(signature),
        tag;

    if (comms && comms !== comments.desc) {
        comments.desc = comms;
    }

    if (params) {
        params.forEach(param => addParam(comments, param, checker));
    }

    if (returns) {
        tag = comments.getOrAddTag("returns");
        addTypeToTag(comments, tag, node, checker);
    }
}

export function addImplementations(comments: jsdoc.Comments, node: utils.ClassOrInterfaceDeclaration, checker: ts.TypeChecker): void {
    if (!node.heritageClauses) {
        return;
    }

    node.heritageClauses.forEach(clause => {
        var tagName = clause.token === ts.SyntaxKind.ExtendsKeyword ? "augments" : "implements";

        clause.types.forEach(clauseType => {
            var typeResult = typehelper.getNodeTypeName(node, clauseType, checker);
            comments.getOrAddTag(tagName, typeResult.name);
        });
    });
}

export function addCallbacks(comments: jsdoc.Comments, node: ts.InterfaceDeclaration, signatures: ts.Signature[], checker: ts.TypeChecker): void {
    signatures.forEach(signature => {
        var comm = comments.clone(),
            sigNode = signature.getDeclaration();

        addName(comm, "callback", node);
        addGeneric(comm, node);
        addFromSignature(comm, sigNode, signature, checker);
        addParent(comm, node, checker);
        addVariation(comm, node, checker);
    });
}

export function addCallSignatures(comments: jsdoc.Comments, node: ts.InterfaceDeclaration, tagPrefix: string, signatures: ts.Signature[], checker: ts.TypeChecker): void {
    signatures.forEach(signature => {
        var comm = comments.addLinked(),
            childNode = signature.getDeclaration();

        comm.getOrAddTag(tagPrefix + "signature");
        addGeneric(comm, childNode);
        addFromSignature(comm, childNode, signature, checker);
        addParent(comm, childNode, checker);
        addVariation(comm, childNode, checker);
    });
}

export function addEnumMembers(comments: jsdoc.Comments, node: ts.EnumDeclaration, checker: ts.TypeChecker): void {
    node.members.forEach(member => {
        //var comm = comments.addLinked();

        var name = utils.getNodeName(member),
            tag = comments.getOrAddTag("property", name);

        if (member.initializer && member.initializer.kind === ts.SyntaxKind.FirstLiteralToken) {
            tag.name += "=" + member.initializer.getText();
        }

        //addName(comm, "member", member);
        //addParent(comm, member, checker);
        //addDefault(comm, member);
    });
}

export function addTypeDefProperty(comments: jsdoc.Comments, tagName: string, node: ts.VariableDeclaration, checker: ts.TypeChecker): void {
    var name = utils.getNodeName(node),
        tag = comments.getOrAddTag(tagName, name),
        nodeType = node.type;

    if (nodeType) {
        var type = checker.getTypeAtLocation(nodeType);
        addTypeToTag(comments, tag, node, checker);
    }
}

//#endregion
