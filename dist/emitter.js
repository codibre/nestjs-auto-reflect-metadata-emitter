"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.before = before;
const ts = __importStar(require("typescript"));
const typescript_1 = require("typescript");
const typescript_loader_1 = require("./typescript-loader");
const tsBinary = new typescript_loader_1.TypeScriptBinaryLoader().load();
function before() {
    return (ctx) => {
        return (sf) => {
            const visitNode = (node) => {
                try {
                    if (tsBinary.isPropertyDeclaration(node)) {
                        const currentDecorators = tsBinary.getDecorators(node);
                        if (currentDecorators)
                            return node;
                        const expression = ts.factory.createDecorator({});
                        return tsBinary.factory.updatePropertyDeclaration(node, [
                            ...(tsBinary.getModifiers(node) ?? []),
                            {
                                kind: typescript_1.SyntaxKind.Decorator,
                                expression,
                                flags: 0,
                                end: 0,
                            },
                        ], node.name, node.questionToken ?? node.exclamationToken, node.type, node.initializer);
                    }
                    else if (tsBinary.isClassDeclaration(node)) {
                        const classNode = tsBinary.visitEachChild(node, visitNode, ctx);
                        const currentDecorators = tsBinary.getDecorators(classNode);
                        if (currentDecorators)
                            return classNode;
                        const expression = ts.factory.createDecorator({});
                        return tsBinary.factory.updateClassDeclaration(classNode, [
                            ...(tsBinary.getModifiers(classNode) ?? []),
                            {
                                kind: typescript_1.SyntaxKind.Decorator,
                                expression,
                                flags: 0,
                                end: 0,
                                parent: classNode,
                            },
                        ], classNode.name, classNode.typeParameters, classNode.heritageClauses, classNode.members);
                    }
                    else if (tsBinary.isMethodDeclaration(node)) {
                        const currentDecorators = tsBinary.getDecorators(node);
                        if (currentDecorators)
                            return node;
                        const expression = ts.factory.createDecorator({});
                        return tsBinary.factory.updateMethodDeclaration(node, [
                            ...(tsBinary.getModifiers(node) ?? []),
                            expression,
                        ], node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters, node.type, node.body);
                    }
                    return tsBinary.visitEachChild(node, visitNode, ctx);
                }
                catch {
                    return node;
                }
            };
            return tsBinary.visitNode(sf, visitNode);
        };
    };
}
//# sourceMappingURL=emitter.js.map