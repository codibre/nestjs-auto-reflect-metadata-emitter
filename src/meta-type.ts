export type ClassType<T extends object = object> = abstract new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => T;
export type Key<T extends object = object> = keyof T | keyof ClassType<T>;

export interface ModifiersMetadata {
  public: boolean;
  readonly: boolean;
  static: boolean;
  abstract: boolean;
  accessor: boolean;
  async: boolean;
  const: boolean;
  override: boolean;
  private: boolean;
  protected: boolean;
  exported: boolean;
}

export interface BaseMetadata {
  modifiers: ModifiersMetadata;
}

export interface ConstructorMetadata<T extends object = object>
  extends BaseMetadata {
  cls: ClassType<T>;
  args: unknown[];
}
export interface MethodMetadata<T extends object = object>
  extends BaseMetadata {
  name: Key<T>;
  args: unknown[];
  returnType: unknown;
  propertyDescriptor: PropertyDescriptor;
}
export interface PropertyMetadata<T extends object = object>
  extends BaseMetadata {
  name: Key<T>;
  type: unknown;
}

export interface ClassMetadata<T extends object = object> {
  ctor: ConstructorMetadata<T>;
  properties: Map<Key<T>, PropertyMetadata<T>>;
  methods: Map<Key<T>, MethodMetadata<T>>;
}
