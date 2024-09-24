import { TsConfigProvider } from './tsconfig-provider';
import { TypeScriptBinaryLoader } from './typescript-loader';
import tsPaths = require('tsconfig-paths');
import os from 'os';
import { posix } from 'path';

export const tsLoader = new TypeScriptBinaryLoader();
export const tsBinary = tsLoader.load();
export const tsConfigProvider = new TsConfigProvider(tsLoader);
export const tsConfig = tsConfigProvider.getByConfigFilename('tsconfig.json');
const { paths = {}, baseUrl = './' } = tsConfig.options;
export const matcher = tsPaths.createMatchPath(baseUrl, paths, ['main']);

export function getModuleRealPath(text: string) {
  let result = matcher(text, undefined, undefined, [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
  ]);
  if (!result) {
    return;
  }
  if (os.platform() === 'win32') {
    result = result.replace(/\\/g, '/');
  }
  try {
    // Installed packages (node modules) should take precedence over root files with the same name.
    // Ref: https://github.com/nestjs/nest-cli/issues/838
    const packagePath = require.resolve(text, {
      paths: [process.cwd(), ...module.paths],
    });
    if (packagePath) {
      return text;
    }
  } catch {
    // ignore
  }

  const resolvedPath = posix.relative(process.cwd(), result) || './';
  return resolvedPath[0] === '.' ? resolvedPath : './' + resolvedPath;
}
