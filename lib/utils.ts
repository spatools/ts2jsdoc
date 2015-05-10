import ts = require("typescript");

var isExternalRegexp = /"[^"]+"/,
    fixRepeatable = /^\.\.\.(?:Array\.<)?(.+)(?:(?:>)|(?:\[\]))/g,
    fixGenerics = /([^<\.]+)<([^>]+)>/g,
    fixGenericsArrays = /([^<]+)\.<(.+)>\[\]$/g;

export type ClassOrInterfaceDeclaration = ts.ClassDeclaration | ts.InterfaceDeclaration;
export type NodeWithName = ts.VariableDeclaration | ts.FunctionDeclaration | ts.EnumMember | ClassOrInterfaceDeclaration | ts.ModuleDeclaration;
export type NodeWithType = ts.VariableDeclaration | ts.SignatureDeclaration | ts.PropertyDeclaration | ts.ParameterDeclaration;
export type NodeWithTypeParameters = ClassOrInterfaceDeclaration | ts.SignatureDeclaration;
export type NodeWithInitializer = ts.VariableDeclaration | ts.ParameterDeclaration | ts.EnumMember;

export function getNodeName(node: ts.Node): string {
    var decla = (<ts.Declaration>node);

    if (!decla || !("name" in decla) || ("expression" in decla.name)) {
        return null;
    }

    return (<ts.Identifier>decla.name).text;
}

export function getDefault(node: NodeWithInitializer): string {
    var initializer = <ts.Identifier>node.initializer;
    if (!initializer) {
        return null;
    }

    return initializer.text || initializer.getText();
}

export function getParentName(node: ts.Node, checker: ts.TypeChecker): string {
    var symbol;
    var kinds = [
        ts.SyntaxKind.ClassDeclaration,
        ts.SyntaxKind.InterfaceDeclaration,
        ts.SyntaxKind.ModuleDeclaration,
        ts.SyntaxKind.EnumDeclaration,
        ts.SyntaxKind.SourceFile,
        ts.SyntaxKind.TypeLiteral
    ];

    while (kinds.indexOf(node.parent.kind) === -1) {
        node = node.parent;
    }

    if (node.parent.kind === ts.SyntaxKind.ClassDeclaration ||
        node.parent.kind === ts.SyntaxKind.InterfaceDeclaration ||
        node.parent.kind === ts.SyntaxKind.EnumDeclaration) {

        symbol = checker.getTypeAtLocation(node.parent).getSymbol();
        return checker.getFullyQualifiedName(symbol).replace(/"/g, "");
    }
    else if (node.parent.kind === ts.SyntaxKind.ModuleDeclaration) {
        symbol = checker.getTypeAtLocation(node.parent).getSymbol();
        var typeName = checker.getFullyQualifiedName(symbol).replace(/"/g, "");

        return (isExternal(<ts.ModuleDeclaration>node.parent) ? "module:" : "") + typeName;
    }
    else if (node.parent.kind === ts.SyntaxKind.TypeLiteral) {
        return getAnonymousFullName(<NodeWithType>node.parent, checker);
    }
    else { //(node.parent.kind === ts.SyntaxKind.SourceFile)
        return (<ts.SourceFile>node).amdModuleName;
    }

    return null;
}
export function getAnonymousName(node: ts.Node): string {
    var nodeType = (<NodeWithType>node).type,
        nodeName, tagName = "";

    nodeName = getNodeName(node);

    var kinds = [
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.Property,
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.Method,
        ts.SyntaxKind.Parameter
    ];

    while (kinds.indexOf(node.kind) === -1) {
        node = <NodeWithType>node.parent;
        nodeName = getNodeName(node);

        if (!node) {
            var msg =
                "Unknow scenario during anonymous name construction.\n" +
                "Node kind:\t" + getSyntaxKindString(node) + "\n" +
                "Node text:\t" + node.getText();

            var err: any = new Error(msg);
            err.node = node;
            throw err;
        }
    }

    if (node.kind === ts.SyntaxKind.FunctionDeclaration || node.kind === ts.SyntaxKind.Method) {
        tagName = "Returns";
    }
    else if (node.kind === ts.SyntaxKind.Parameter) {
        tagName = nodeName.substr(0, 1).toUpperCase() + nodeName.substr(1);
        nodeName = getNodeName(node.parent);
    }
    //else if (node.kind === ts.SyntaxKind.VariableDeclaration || node.kind === ts.SyntaxKind.Property) {
    //    //tagName = isCallback ? "Callback" : "Type";
    //}

    nodeName = nodeName.substr(0, 1).toUpperCase() + nodeName.substr(1);

    if (nodeType && (<ts.FunctionOrConstructorTypeNode>nodeType).parameters) {
        tagName += "Callback";
    }
    else {
        tagName += "Type";
    }

    return nodeName + tagName;
}
export function getAnonymousFullName(node: NodeWithType, checker: ts.TypeChecker): string {
    var parentName = getParentName(node, checker),
        anonymousName = getAnonymousName(node);

    if (parentName && parentName !== "null") {
        return parentName + "." + anonymousName;
    }
    else {
        return anonymousName;
    }
}

export function formatType(type: string): string {
    if (!type) {
        type = "any";
    }

    type = type.replace(fixRepeatable, "...$1");
    type = type.replace(fixGenerics, "$1.<$2>");
    type = type.replace(fixGenericsArrays, "Array.<$1.<$2>>");
    type = type.replace("typeof", "@link");

    return type;
}
export function formatParam(name: string, node: ts.ParameterDeclaration): string {
    if (!node) {
        return name;
    }

    if (node.dotDotDotToken) {
        name = "..." + name;
    }

    if (node.questionToken || node.initializer) {
        name = "[" + name;

        if (node.initializer) {
            name += "=" + (<any>node).initializer.text || node.initializer.getText();
        }

        name += "]";
    }

    return name;
}

export function isExternal(mod: ts.ModuleDeclaration): boolean {
    return isExternalRegexp.test(mod.name.getText());
}

export function getComments(symbol: ts.Symbol|ts.Signature): string {
    var comments = symbol.getDocumentationComment();

    if (comments && comments.length > 0) {
        return comments.map(part => part.text).join("").replace(/(\r?\n)/g, "$1 * ");
    }
}

export function getSyntaxKindString(node: ts.Node): string {
    return (<any>ts).SyntaxKind[node.kind];
}

export function hasFlag(flags: number, flag: number): boolean {
    return ((flags & flag) === flag);
}
