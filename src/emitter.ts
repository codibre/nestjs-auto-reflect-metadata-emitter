/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ts from 'typescript';
import { TypeScriptBinaryLoader } from './typescript-loader';

const tsBinary = new TypeScriptBinaryLoader().load();

function isStatic(node: ts.MethodDeclaration | ts.ClassDeclaration | ts.PropertyDeclaration) {
  return node.modifiers?.find((x) => x.kind === ts.SyntaxKind.StaticKeyword);
}

export function before() {
  return (ctx: ts.TransformationContext): ts.Transformer<any> => {
    return (sf: ts.SourceFile) => {
      const visitNode = (node: ts.Node): ts.Node => {
        try {
          if (
            (tsBinary.isMethodDeclaration(node) ||
              tsBinary.isPropertyDeclaration(node) ||
              tsBinary.isClassDeclaration(node)) &&
            !tsBinary.getDecorators(node)?.length
            && !isStatic(node)
          ) {
            const decorator = tsBinary.factory.createDecorator(
              tsBinary.factory.createCallExpression(
                tsBinary.factory.createIdentifier('require'),
                undefined,
                [
                  tsBinary.factory.createStringLiteral(
                    'nestjs-emitter/dist/emitter',
                  ),
                ],
              ),
            );
            node = tsBinary.factory.replaceDecoratorsAndModifiers(node, [
              ...(node.modifiers ?? []),
              decorator,
            ]);
            return tsBinary.isClassDeclaration(node)
              ? tsBinary.visitEachChild(node, visitNode, ctx)
              :  node;
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

export function simpleDecorator() {
  //
}
