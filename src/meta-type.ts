// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType = abstract new (...args: any[]) => unknown;
export type Key = string | symbol;

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

export interface ConstructorMetadata extends BaseMetadata {
  cls: ClassType;
  args: unknown[];
}
export interface MethodMetadata extends BaseMetadata {
  name: Key;
  args: unknown[];
  returnType: unknown;
  propertyDescriptor: PropertyDescriptor;
}
export interface PropertyMetadata extends BaseMetadata {
  name: Key;
  type: unknown;
}

export interface ClassMetadata {
  ctor: ConstructorMetadata;
  properties: Map<Key, PropertyMetadata>;
  methods: Map<Key, MethodMetadata>;
}
