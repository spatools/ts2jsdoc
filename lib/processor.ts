import ts = require("typescript");
import jsdoc = require("./jsdoc");
import syntax = require("./syntax");

function getKindsToProcess(): ts.SyntaxKind[] {
    var self = <any>getKindsToProcess;
    if (!self.result) {
        self.result = [
            ts.SyntaxKind.Property,
            ts.SyntaxKind.Method,
            ts.SyntaxKind.Constructor,
            ts.SyntaxKind.GetAccessor,
            ts.SyntaxKind.SetAccessor,
            ts.SyntaxKind.VariableDeclaration,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.ClassDeclaration,
            ts.SyntaxKind.InterfaceDeclaration,
            ts.SyntaxKind.TypeAliasDeclaration,
            ts.SyntaxKind.EnumDeclaration,
            ts.SyntaxKind.ModuleDeclaration,
            ts.SyntaxKind.ImportDeclaration,
            ts.SyntaxKind.ExportAssignment
        ];
    }

    return self.result;
}

function hasToProcess(node: ts.Node): boolean {
    var kinds = getKindsToProcess();
    return kinds.indexOf(node.kind) !== -1;
}

export function process(comments: jsdoc.CommentsList, node: ts.Node, checker: ts.TypeChecker): void {
    if (!hasToProcess(node)) {
        return;
    }

    //var comments = jsdoc.Comments.fromNode(node);

    switch (node.kind) {
        case ts.SyntaxKind.VariableDeclaration:
        case ts.SyntaxKind.Property:
            syntax.forVar(comments, <ts.VariableDeclaration>node, checker);
            break;

        case ts.SyntaxKind.Method:
        case ts.SyntaxKind.FunctionDeclaration:
            syntax.forFunction(comments, <ts.FunctionDeclaration>node, checker);
            break;

        case ts.SyntaxKind.GetAccessor:
        case ts.SyntaxKind.SetAccessor:
            syntax.forAccessor(comments, <ts.AccessorDeclaration>node, checker);
            break;

        case ts.SyntaxKind.InterfaceDeclaration:
            syntax.forInterface(comments, <ts.InterfaceDeclaration>node, checker);
            break;

        case ts.SyntaxKind.ClassDeclaration:
            syntax.forClass(comments, <ts.ClassDeclaration>node, checker);
            break;

        case ts.SyntaxKind.Constructor:
            syntax.forConstructor(comments, <ts.ConstructorDeclaration>node, checker);
            break;

        case ts.SyntaxKind.TypeAliasDeclaration:
            syntax.forType(comments, <ts.TypeAliasDeclaration>node, checker);
            break;

        case ts.SyntaxKind.EnumDeclaration:
            syntax.forEnum(comments, <ts.EnumDeclaration>node, checker);
            break;

        case ts.SyntaxKind.ModuleDeclaration:
            syntax.forModule(comments, <ts.ModuleDeclaration>node, checker);
            break;

        case ts.SyntaxKind.ExportAssignment:
            syntax.forExport(comments, <ts.ExportAssignment>node, checker);
            break;
    }

    //return comments;
}
