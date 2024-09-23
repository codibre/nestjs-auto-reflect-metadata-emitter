# nestjs-auto-reflect-metadata-emitter

So, I got this crazy idea of making every class, property and method emitted through reflect-metadata when compiling a trypescript code.
Long story short I did some research and didn't find a good solution, but figured out that I could use **nest build**, of [@nestjs/cli](https://github.com/nestjs/nest-cli), to manipulate the code before compiling it, so I did.

This is a working in progress, though. The solution is not production ready and I'll list the issues I know, but if you want to test it out:

* Add the plugin in the **.nest-cli.json**
```json
  "compilerOptions": {
    "plugins": [
      "nestjs-auto-reflect-metadata-emitter"
    ]
  }
```
* Make sure tsconfig is set with the following properties:
```ts
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
```
* Use, at least, **typescript 5.3.3**.

After compiling your project, you can check that all the compiled classes are correctly annotated, but probably still not working in most cases. Imported classes, for example, are not being correctly imported if they're only imported for typing (while decorating manually your class, it'll work). That's where I'm stuck in. I'll update the project as soon as I discover how to solve it.