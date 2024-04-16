import type {TopLevelSchema} from '@/schema/jsonSchemaType';

export const SETTINGS_SCHEMA: TopLevelSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Settings',
  description: 'MetaConfigurator settings',
  type: 'object',
  additionalProperties: false,
  properties: {
    dataFormat: {
      type: 'string',
      description: 'The data format to use for the configuration files.',
      default: 'json',
      enum: ['json', 'yaml'],
    },
    guiEditorOnRightSide: {
      type: 'boolean',
      description:
        'If enabled, the GUI editor will be on the right side and the code editor on the left. Otherwise, it will be the opposite way.',
      default: true,
    },
    codeEditor: {
      type: 'object',
      description: 'Settings of the code editor.',
      properties: {
        fontSize: {
          type: 'integer',
          description: 'The font size of the code editor.',
          default: 14,
          minimum: 10,
          maximum: 40,
        },
      },
    },
    guiEditor: {
      type: 'object',
      description: 'GUI Editor related settings belong here.',
      properties: {
        maximumDepth: {
          type: 'integer',
          description:
            'The maximum depth of the GUI editor. If the depth of the configuration object is higher, the GUI editor will not show the deeper levels, but they can be navigated by clicking on the property name',
          default: 5,
          minimum: 1,
          maximum: 20,
        },
        propertySorting: {
          type: 'string',
          description:
            "The sorting of the properties in the GUI editor. If set to 'priorityOrder', the order will be required properties first, then optional properties, then additional and pattern properties and finally deprecated properties. If set to 'dataOrder', the properties will be displayed in the order they are in the configuration object. If set to 'schemaOrder', the properties will be sorted according to the order in the schema.",
          default: 'schemaOrder',
          enum: ['priorityOrder', 'schemaOrder', 'dataOrder'],
        },
      },
      additionalProperties: false,
    },
    metaSchema: {
      type: 'object',
      description: 'Meta Schema related settings belong here.',
      properties: {
        allowBooleanSchema: {
          type: 'boolean',
          description:
              'Whether a JSON Schema definition can also be just \'true\' or \'false\'. Having this this option enabled will increase the choices that have to be made when defining a sub-schema in the schema editor.',
          default: false,
        },
        allowMultipleTypes: {
          type: 'boolean',
          description:
              'Whether an object property can be assigned to multiple types (e.g. string and number). Having this this option enabled will increase the choices that have to be made when defining the type of an object property in the schema editor, but also allows more flexibility. An alternative to defining multiple types directly is using the \'anyOf\' or \'oneOf\' keywords.',
          default: false,
        },
        showAdditionalPropertiesButton: {
          type: 'boolean',
          description:
              'Most schemas allow additional properties (e.g. adding properties to the data that are not defined in the schema). Therefore, for the GUI to be complete, it would always provide an \'Add Property\' button to add properties unknown to the schema. In practice, in the schema editor this option is not used much, but it can confuse the user. For example, they might try adding new fields for their schema by using this button, although that does not have any effect on the schema.',
          default: false,
        },
        objectTypesComfort: {
          type: 'boolean',
          description:
              'This is a comfort feature: the original JSON Meta Schema allows properties of a particular type to have example values, constant values, default values or enum values of different type. For example, a field for numbers could have a string as a default value. This meta schema option forces the same type for all these values to enable the tool to auto-select the corresponding type in the schema editor, avoiding the need for the user to manually select the types.',
          default: true,
        },
        rootMustBeObject: {
          type: 'boolean',
          description:
              'The original JSON Meta Schema allows a JSON schema to also be of other types than an object. Because any non-trivial schema is an object, this option forces the root schema to be an object, to avoid showing the user unusual schema options.',
          default: true,
        },
      },
      additionalProperties: false,
    },
    debuggingActive: {
      type: 'boolean',
      description: 'If enabled, the internal application state is shown.',
      default: false,
    },
  },
};
