import ts = require("typescript");
import jsdoc = require("./jsdoc");
import common = require("./common");
import utils = require("./utils");

export function forVar(list: jsdoc.CommentsList, node: ts.VariableDeclaration, checker: ts.TypeChecker): void {
    var parent = node.parent, comments;

    if (parent.kind === ts.SyntaxKind.TypeLiteral) {
        comments = list.get("typedef", utils.getAnonymousName(parent), utils.getParentName(parent.parent, checker));
        common.addTypeDefProperty(comments, "property", node, checker);
    }
    else {
        comments = list.addFromNode(node);
        common.addName(comments, "member", node, checker);
        common.addDefault(comments, node);
        common.addParent(comments, node, checker);
        common.addModifier(comments, node);
    }
}

export function forFunction(list: jsdoc.CommentsList, node: ts.FunctionDeclaration, checker: ts.TypeChecker): void {
    var comments = list.addFromNode(node),
        signature = checker.getSignatureFromDeclaration(node);

    common.addName(comments, "function", node);
    common.addVariation(comments, node, checker);
    common.addGeneric(comments, node);
    common.addFromSignature(comments, node, signature, checker);
    common.addParent(comments, node, checker);
    common.addModifier(comments, node);
}

export function forAccessor(list: jsdoc.CommentsList, node: ts.AccessorDeclaration, checker: ts.TypeChecker): void {
    //console.log(node.getText());
}

export function forInterface(list: jsdoc.CommentsList, node: ts.InterfaceDeclaration, checker: ts.TypeChecker): void {
    var comments = list.addFromNode(node),
        type = checker.getTypeAtLocation(node),
        callSignatures = type.getCallSignatures(),
        ctorSignatures = type.getConstructSignatures();

    if (node.members.length === callSignatures.length) {
        common.addCallbacks(comments, node, callSignatures, checker);
        comments.clean();
    }
    else {
        common.addName(comments, "interface", node);
        common.addGeneric(comments, node);
        common.addImplementations(comments, node, checker);
        common.addParent(comments, node, checker);
        common.addCallSignatures(comments, node, "ctor", ctorSignatures, checker);
        common.addCallSignatures(comments, node, "call", callSignatures, checker);
        common.addVariation(comments, node, checker, true);
    }
}

export function forClass(list: jsdoc.CommentsList, node: utils.ClassOrInterfaceDeclaration, checker: ts.TypeChecker): void {
    var comments = list.addFromNode(node);
    common.addName(comments, "class", node);
    common.addVariation(comments, node, checker);
    common.addGeneric(comments, node);
    common.addImplementations(comments, node, checker);
    common.addParent(comments, node, checker);
}

export function forConstructor(list: jsdoc.CommentsList, node: ts.ConstructorDeclaration, checker: ts.TypeChecker): void {
    var comments = list.addFromNode(node),
        signature = checker.getSignatureFromDeclaration(node);

    comments.getOrAddTag("ctor");
    common.addVariation(comments, node, checker);
    common.addParent(comments, node, checker);
    common.addFromSignature(comments, node, signature, checker);
}

export function forType(list: jsdoc.CommentsList, node: ts.TypeAliasDeclaration, checker: ts.TypeChecker): void {
    var comments = list.addFromNode(node);
    common.addName(comments, "typedef", node, checker);
    common.addVariation(comments, node, checker);
    common.addParent(comments, node, checker);
}

export function forEnum(list: jsdoc.CommentsList, node: ts.EnumDeclaration, checker: ts.TypeChecker): void {
    var comments = list.addFromNode(node);
    common.addName(comments, "enum", node);
    common.addModifier(comments, node);
    common.addParent(comments, node, checker);
    common.addEnumMembers(comments, <ts.EnumDeclaration>node, checker);
}

export function forModule(list: jsdoc.CommentsList, node: ts.ModuleDeclaration, checker: ts.TypeChecker): void {
    var comments = list.addFromNode(node);

    if (utils.isExternal(node)) {
        //common.addName(comments, "namespace", node);
        comments.getOrAddTag("module").name = node.name.text.replace(/"/g, "");
        common.addVariation(comments, node, checker, true);
    }
    else {
        common.addName(comments, "namespace", node);
        common.addParent(comments, node, checker);
        common.addVariation(comments, node, checker, true);
    }
}

export function forExport(list: jsdoc.CommentsList, node: ts.ExportAssignment, checker: ts.TypeChecker): void {
    //console.log(node.getText());
}
