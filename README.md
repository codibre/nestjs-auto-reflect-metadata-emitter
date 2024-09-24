[![Actions Status](https://github.com/Codibre/nestjs-auto-reflect-metadata-emitter/workflows/build/badge.svg)](https://github.com/Codibre/nestjs-auto-reflect-metadata-emitter/actions)
[![Actions Status](https://github.com/Codibre/nestjs-auto-reflect-metadata-emitter/workflows/test-coverage/badge.svg)](https://github.com/Codibre/nestjs-auto-reflect-metadata-emitter/actions)
[![Actions Status](https://github.com/Codibre/nestjs-auto-reflect-metadata-emitter/workflows/lint/badge.svg)](https://github.com/Codibre/nestjs-auto-reflect-metadata-emitter/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9c5d5262333faef1e8d1/test_coverage)](https://codeclimate.com/github/codibre/nestjs-auto-reflect-metadata-emitter/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/9c5d5262333faef1e8d1/maintainability)](https://codeclimate.com/github/codibre/nestjs-auto-reflect-metadata-emitter/maintainability)
![downloads per month](https://img.shields.io/npm/dm/nestjs-auto-reflect-metadata-emitter)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

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

* Install the plugin:
```
  npm i -D nestjs-auto-reflect-metadata-emitter
```
* Add the plugin in the **.nest-cli.json**
```json
  "compilerOptions": {
    "plugins": [
      "nestjs-auto-reflect-metadata-emitter/plugin"
    ]
  }
```
* Make sure tsconfig is set with the following properties:
```ts
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
```
* Use, at least, **typescript 5.3.3**.
* Compile your application using nest build, and test it using nest start

## How to access metadata

Metadata of all classes is accessible through the method **getClassMetadata**, where you just need to inform the class which you want the metadata of.
You can also iterate over all metadata registered through **iterateMetadata**.
Finally, metadata may be a sensitive data of your application, so, you can erase all its information using **clearAllMetadata**. We recommend you to do so, if you use this library, don't keep any hard logic depending on what this package will register, just construct whenever you need and clear it all at the end.



## How to use it with Jest?

You can set the transformer of this library to run with jest following the example below:

```json
"transform": {
      "^.+\\.(t|j)s$": [
        "ts-jest",
        {
          "astTransformers": {
            "before": ["node_modules/nestjs-auto-reflect-metadata-emitter/plugin"]
          }
        }
      ]
    }
```

This will be enough to make it apply it during transpilation.

## Helpers to apply decorators

One of the advantages of having all this metadata emitted is that you can apply decorators for existing classes in separated scopes! To do that, there're two helper functions this library offers:

the first one is **applyPropertyAndMethodsDecorators**:
```ts
applyPropertyAndMethodsDecorators(MyClass, {
  prop1: [
    @ApiProperty({
      example: '123'
    })
  ],
  prop2: [
    @ApiProperty()
    @IsEnum(MyEnum)
  ],
  [DEFAULT]: [@ApiProperty()]
})
```

Notice the symbol **DEFAULT**, it's a symbol imported from our library and serves to purpose of define a decorator that'll be applied to every property or method that doesn't have a specific set os decorators informed. This second parameter is a strongly typed object and it'll only allow names of properties and methods of MyClass (static or not), or the **DEFAULT** symbol.
Executing this code will have the same effect as applying the decorators directly in the class.

The second helper method is simpler, **applyClassDecorators**:

```ts
applyClassDecorators(MyClass, [
    @Model()
    @PrimaryKey({ field1: 1, field2: 2 })
  ]
})
```

This one will apply the decorators to the class itself, not its properties.

## What we're not doing yet.

* We're not generating metadata of get and set accessors;

This is a point of evolution of this library and we'll address them as soon as possible. If you have any suggestions or contributions to do, feel free to contact us!
