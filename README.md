# nestjs-auto-reflect-metadata-emitter

So, I got this crazy idea of making every class, property and method emitted through reflect-metadata when compiling a trypescript code.
Long story short I did some research and didn't find a good solution, but figured out that I could use **nest build**, of [@nestjs/cli](https://github.com/nestjs/nest-cli), to manipulate the code before compiling it, so I did.

This is a working in progress, though, and I'd love to get some suggestions or contributions.

## But why?

There're some situations where having access to every class metadata during runtime is quite useful. Let's say you have an application separated in layers: domain, application, infrastructure, and so son, but you fill up your domain with nestjs, inversify, or tsyringe decorators, or even mongoose, but you want to do a external reference free domain layer. If you have the metadata, it's possible to create all these classes decorations programmatically at infrastructure layer!

Let's say you're using @nestjs/swagger, and you have to put in every property the @ApiProperty decorator, even though you don't specify nothing special. Having all de metadata emitted, you can create a decorator where you just decorate the class, and automatizes the decoration of all the properties!

## How to use it?

As I said, this is a @nestjs/cli plugin, so you need to use nest build to compile your solution. There's no problem if you're not using nestjs in anything else, the nest build can be used stand alone.

Now, to use this plugin, do the following steps:

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
