export interface SettingsInterfaceRoot {
  debuggingActive: boolean;
  guiEditorOnRightSide: boolean;
  dataFormat: DataFormat;
  codeEditor: SettingsInterfaceCodeEditor;
  guiEditor: SettingsInterfaceGuiEditor;
  metaSchema: SettingsInterfaceMetaSchema;
}

export interface SettingsInterfaceCodeEditor {
  fontSize: number;
}

export interface SettingsInterfaceGuiEditor {
  maximumDepth: number;
  propertySorting: PropertySorting;
}

export interface SettingsInterfaceMetaSchema {
  showButtonToAddAdditionalProperties: boolean;
  allowBooleanSchema: boolean;
  allowMultipleTypes: boolean;
  forceSameTypeForExamplesEnumConstantAndDefault: boolean;
}

export enum PropertySorting {
  PRIORITY_ORDER = 'priorityOrder',
  SCHEMA_ORDER = 'schemaOrder',
  DATA_ORDER = 'dataOrder',
}

export enum DataFormat {
  JSON = 'json',
  YAML = 'yaml',
}
