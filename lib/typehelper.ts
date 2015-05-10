import ts = require("typescript");
import utils = require("./utils");

export interface NodeTypeNameResult {
    name: string;
    anonymous: ts.TypeNode[];
    end?: boolean;
}

function getIntrinsicResult(type: ts.Type, checker: ts.TypeChecker): NodeTypeNameResult {
    return {
        name: checker.typeToString(type),
        anonymous: []
    };
}

function getAnonymousResult(node: utils.NodeWithType, typeNode: ts.TypeNode, checker: ts.TypeChecker): NodeTypeNameResult {
    return {
        name: utils.formatType(utils.getAnonymousFullName(node, checker)),
        anonymous: [typeNode]
    };
}

function getLinkedResult(typeNode: ts.TypeNode): NodeTypeNameResult {
    return {
        name: utils.formatType(typeNode.getText()),
        anonymous: []
    };
}

function getUnionTypeResult(node: utils.NodeWithType, typeNode: ts.UnionTypeNode, checker: ts.TypeChecker): NodeTypeNameResult {
    var result = { name: "", anonymous: [] };

    result.name = typeNode.types.map(typeArg => {
        var tmp = getNodeTypeName(node, typeArg, checker);
        result.anonymous = result.anonymous.concat(tmp.anonymous);
        return tmp.name;
    }).join(" | ");

    return result;
}

function getArrayResult(node: utils.NodeWithType, typeNode: ts.ArrayTypeNode, checker: ts.TypeChecker): NodeTypeNameResult {
    var result = getNodeTypeName(node, typeNode.elementType, checker);
    result.name = utils.formatType(result.name + "[]");
    return result;
}

function getGenericPart(node: utils.NodeWithType, typeNode: ts.TypeNode, checker: ts.TypeChecker): NodeTypeNameResult {
    var result: NodeTypeNameResult,
        typeTemp: ts.TypeNode,
        typeArgs: ts.NodeArray<ts.TypeNode>,
        typeParams: ts.NodeArray<ts.TypeParameterDeclaration>;

    if (typeArgs = (<ts.TypeReferenceNode>typeNode).typeArguments) {
        result = { name: "", anonymous: [] };

        result.name = typeArgs.map(typeArg => {
            var tmp = getNodeTypeName(node, typeArg, checker);
            result.anonymous = result.anonymous.concat(tmp.anonymous);
            return tmp.name;
        }).join(", ");

        result.name = "<" + result.name + ">";
        return result;
    }

    if (typeParams = (<ts.FunctionOrConstructorTypeNode>node).typeParameters) {
        return {
            name: "<" + typeParams.map(utils.getNodeName).join(", ") + ">",
            anonymous: []
        };
    }
}

export function getNodeTypeName(node: utils.NodeWithType, typeNode: ts.TypeNode, checker: ts.TypeChecker, givenType?: ts.Type): NodeTypeNameResult {
    if (typeNode.getText().indexOf("typeof") === 0) {
        return getLinkedResult(typeNode);
    }

    var type = typeNode ? checker.getTypeAtLocation(typeNode) : givenType,
        symbol = type.symbol,
        tmp: NodeTypeNameResult,
        result: NodeTypeNameResult;

    if (utils.hasFlag(ts.TypeFlags.Intrinsic, type.flags) ||
        utils.hasFlag(type.flags, ts.TypeFlags.TypeParameter)) {
        return getIntrinsicResult(type, checker);
    }

    if (!typeNode) {
        typeNode = (<ts.VariableDeclaration>symbol.valueDeclaration).type;
    }

    if (utils.hasFlag(type.flags, ts.TypeFlags.Anonymous)) {
        return getAnonymousResult(node, typeNode, checker);
    }
    if (utils.hasFlag(type.flags, ts.TypeFlags.Union) && (<ts.UnionTypeNode>typeNode).types) {
        return getUnionTypeResult(node, <ts.UnionTypeNode>typeNode, checker);
    }
    if (typeNode.kind === ts.SyntaxKind.ArrayType) {
        return getArrayResult(node, <ts.ArrayTypeNode>typeNode, checker);
    }

    result = {
        name: symbol ?
            checker.getFullyQualifiedName(symbol).replace(/"/g, "") :
            checker.typeToString(type),
        anonymous: []
    };

    tmp = getGenericPart(node, typeNode, checker);
    if (tmp) {
        result.name += tmp.name;
        result.anonymous = tmp.anonymous;
    }

    result.name = utils.formatType(result.name);
    return result;
}
