/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ts from 'typescript';
import { Expression, SyntaxKind } from 'typescript';
import { TypeScriptBinaryLoader } from './typescript-loader';

const tsBinary = new TypeScriptBinaryLoader().load();

export function before() {
  return (ctx: ts.TransformationContext): ts.Transformer<any> => {
    return (sf: ts.SourceFile) => {
      const visitNode = (node: ts.Node): ts.Node => {
        try {
          if (tsBinary.isPropertyDeclaration(node)) {
            const currentDecorators = tsBinary.getDecorators(node);
            if (currentDecorators) return node;
            const expression = ts.factory.createDecorator({} as Expression);
            return tsBinary.factory.updatePropertyDeclaration(
              node,
              [
                ...(tsBinary.getModifiers(node) ?? []),
                {
                  kind: SyntaxKind.Decorator,
                  expression,
                  flags: 0,
                  end: 0,
                },
              ] as ts.Modifier[],
              node.name,
              node.questionToken ?? node.exclamationToken,
              node.type,
              node.initializer,
            );
          } else if (tsBinary.isClassDeclaration(node)) {
            // const classNode = tsBinary.visitEachChild(node, visitNode, ctx);
            // const currentDecorators = tsBinary.getDecorators(classNode);
            // if (currentDecorators) return classNode;
            // const expression = ts.factory.createDecorator({} as Expression);
            // return tsBinary.factory.updateClassDeclaration(
            //   classNode,
            //   [
            //     ...(tsBinary.getModifiers(classNode) ?? []),
            //     {
            //       kind: SyntaxKind.Decorator,
            //       expression,
            //       flags: 0,
            //       end: 0,
            //       parent: classNode,
            //     },
            //   ] as ts.Modifier[],
            //   classNode.name,
            //   classNode.typeParameters,
            //   classNode.heritageClauses,
            //   classNode.members,
            // );
          } else if (tsBinary.isMethodDeclaration(node)) {
            // const currentDecorators = tsBinary.getDecorators(node);
            // if (currentDecorators) return node;
            // const expression = ts.factory.createDecorator({} as Expression);
            // return tsBinary.factory.updateMethodDeclaration(
            //   node,
            //   [
            //     ...(tsBinary.getModifiers(node) ?? []),
            //     expression,
            //   ] as ts.Modifier[],
            //   node.asteriskToken,
            //   node.name,
            //   node.questionToken,
            //   node.typeParameters,
            //   node.parameters,
            //   node.type,
            //   node.body,
            // );
          }
          return tsBinary.visitEachChild(node, visitNode, ctx);
        } catch {
          return node;
        }
      };
      return tsBinary.visitNode(sf, visitNode);
    };
  };
}
