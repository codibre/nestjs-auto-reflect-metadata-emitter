import { existsSync } from 'fs';
import { dirname } from 'path';
import { getModuleRealPath } from './ts-loader';
import ts from 'typescript';

export function moduleExists(sf: ts.SourceFile, moduleName: string) {
  try {
    let tsConfigTreatedModuleName = getModuleRealPath(moduleName);
    if (!tsConfigTreatedModuleName && moduleName.startsWith('.')) {
      tsConfigTreatedModuleName = `${dirname(sf.fileName)}/${moduleName}`;
    }
    if (tsConfigTreatedModuleName
        && (existsSync(tsConfigTreatedModuleName)
        || existsSync(`${tsConfigTreatedModuleName}.ts`)
        || existsSync(`${tsConfigTreatedModuleName}.js`))
    ) return true;
    require(tsConfigTreatedModuleName ?? moduleName);
    return true;
  } catch {
    return false;
  }
}
