
export interface SettingsInterfaceRoot {
  debuggingActive: boolean;
  guiEditorOnRightSide: boolean;
  dataFormat: DataFormat;
  codeEditor: SettingsInterfaceCodeEditor;
  guiEditor: SettingsInterfaceGuiEditor;
}

export interface SettingsInterfaceCodeEditor {
  fontSize: number
}

export interface SettingsInterfaceGuiEditor {
  maximumDepth: number;
  propertySorting: PropertySorting;
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