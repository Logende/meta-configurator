import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Path} from "../../../utility/path";
import type { TopLevelSchema} from "../../../schema/jsonSchemaType";
import {EdgeType, SchemaGraph, SchemaObjectNodeData} from "../schemaDiagramTypes";
import {
  generateAttributeEdges,
  generateObjectAttributes, generateObjectSpecialPropertyEdges,
  generateObjectTitle,
  identifyObjects
} from "../schemaGraphConstructor";

vi.mock('@/dataformats/formatRegistry', () => ({
  useDataConverter: () => ({
    stringify: (data: any) => JSON.stringify(data),
    parse: (data: string) => JSON.parse(data),
  }),
}));

describe('test schema graph constructor with objects and attributes with advanced keywords such as oneOf', () => {
  let currentPath: Path;
  let schema: TopLevelSchema = {
        type: 'object',
        required: ['propertyObject'],
        $defs: {
          person: {
            type: 'object',
            required: ['name'],
            properties: {
              name: {type: 'string'},
            }
          },
          animal: {
            type: 'object',
            required: ['species'],
            properties: {
              species: {type: 'string'},
            },
          },
          researcher: {
            required: ['researchField'],
            type: 'object',
            properties: {
              researchField: {type: 'string'},
            },
          },
          livingBeing: {
            type: 'object',
            required: ['age'],
            properties: {
              age: {type: 'number'},
            },
          },
      },
      properties: {
        propertySimple: {
          type: 'string',
        },
        propertyObject: {
          type: 'object',
          properties: {
            someNumber: { type: 'number' },
          },
        },
      },
      allOf: [
        {
          $ref: '#/definitions/liveBeing',
        },
        {
          type: 'object',
          properties: {
            address: {
              type: 'string'
            }
          }
        }
      ],
        oneOf: [
            {
            $ref: '#/definitions/researcher',
            },
          {
            title: 'Farmer',
            type: 'object',
            properties: {
              farmSize: {type: 'number'},
            },
          },
          true,
        ],
    anyOf: [
        {
            $ref: '#/definitions/person',
        },
        {
            $ref: '#/definitions/animal',
        },
        ],
    if: {
      $ref: '#/definitions/researcher',
    },
    then: {
      type: "object",
        properties: {
          propertyObject: {
            properties: {
              someNumber: {
                type: 'number',
              multipleOf: 42},
            },
          }
        },
        else: true,
    }


      };

  let defs: Map<string, SchemaObjectNodeData>;

  beforeEach(() => {
    currentPath = [];
    defs = new Map();

    identifyObjects(currentPath, schema, defs);
    // @ts-ignore
    for (const [key, value] of Object.entries(schema.$defs)) {
      identifyObjects(['$defs', key], value,  defs);
    }
  });


  it('identify objects', () => {
    expect(defs.size).toEqual(24);
    expect(defs.has('')).toBeTruthy();
    expect(defs.has('$defs.person')).toBeTruthy();
    expect(defs.has('$defs.person.properties.name')).toBeTruthy();
    expect(defs.has('$defs.animal')).toBeTruthy();
    expect(defs.has('$defs.animal.properties.species')).toBeTruthy();
    expect(defs.has('$defs.researcher')).toBeTruthy();
    expect(defs.has('$defs.researcher.properties.researchField')).toBeTruthy();
    expect(defs.has('$defs.livingBeing')).toBeTruthy();
    expect(defs.has('$defs.livingBeing.properties.age')).toBeTruthy();
    expect(defs.has('properties.propertySimple')).toBeTruthy();
    expect(defs.has('properties.propertyObject')).toBeTruthy();
    expect(defs.has('properties.propertyObject.properties.someNumber')).toBeTruthy();
    expect(defs.has('allOf.0')).toBeTruthy();
    expect(defs.has('allOf.1')).toBeTruthy();
    expect(defs.has('allOf.1.properties.address')).toBeTruthy();
    expect(defs.has('oneOf.0')).toBeTruthy();
    expect(defs.has('oneOf.1')).toBeTruthy();
    expect(defs.has('oneOf.2')).toBeFalsy();
    expect(defs.has('oneOf.1.properties.farmSize')).toBeTruthy();
    expect(defs.has('anyOf.0')).toBeTruthy();
    expect(defs.has('anyOf.1')).toBeTruthy();
    expect(defs.has('if')).toBeTruthy();
    expect(defs.has('then')).toBeTruthy();
  expect(defs.has('then.properties.propertyObject')).toBeTruthy();
  expect(defs.has('then.properties.propertyObject.properties.someNumber')).toBeTruthy();
  expect(defs.has('else')).toBeFalsy();
  });


  it('generate object attributes', () => {
    const rootNode = defs.get('')!;
    expect(rootNode).toBeDefined();
    rootNode.attributes = generateObjectAttributes(rootNode.absolutePath, rootNode.schema, defs);

    expect(rootNode.attributes.length).toEqual(2);
    expect(rootNode.attributes[0].name).toEqual('propertySimple');
    expect(rootNode.attributes[0].absolutePath).toEqual(['properties', 'propertySimple']);

    expect(rootNode.attributes[1].name).toEqual('propertyObject');
    expect(rootNode.attributes[1].absolutePath).toEqual(['properties', 'propertyObject']);

  });


  it('generate object title', () => {
    // filter defs for nodes that have schema.type 'object'
    const objectNodeCount = Array.from(defs.values()).filter(node => node.schema.type === 'object').length;
    expect(objectNodeCount).toEqual(9);

    // We care about titles of nodes that define objects only
    const rootNode = defs.get('')!;
    expect(generateObjectTitle(rootNode.absolutePath, rootNode.schema)).toEqual('root');

    const propComplex = defs.get('properties.propertyObject')!;
    expect(generateObjectTitle(propComplex.absolutePath, propComplex.schema)).toEqual('propertyObject');

    const person = defs.get('$defs.person')!;
    expect(generateObjectTitle(person.absolutePath, person.schema)).toEqual('person');

    const animal = defs.get('$defs.animal')!;
    expect(generateObjectTitle(animal.absolutePath, animal.schema)).toEqual('animal');

    const researcher = defs.get('$defs.researcher')!;
    expect(generateObjectTitle(researcher.absolutePath, researcher.schema)).toEqual('researcher');

    const livingBeing = defs.get('$defs.livingBeing')!;
    expect(generateObjectTitle(livingBeing.absolutePath, livingBeing.schema)).toEqual('livingBeing');

    const allOf1 = defs.get('allOf.1')!;
    // allOf element at index 1 has no title, so we use the index as title // TODO: Better title!
    expect(generateObjectTitle(allOf1.absolutePath, allOf1.schema)).toEqual('1');

    const oneOf1 = defs.get('oneOf.1')!;
    // oneOf element at index 1 has a title, so we use it
    expect(generateObjectTitle(oneOf1.absolutePath, oneOf1.schema)).toEqual('Farmer');

    const thenNode = defs.get('then')!;
    expect(generateObjectTitle(thenNode.absolutePath, thenNode.schema)).toEqual('then');
  });

  it('generate attribute edges', () => {
    for (const node of defs.values()) {
        node.attributes = generateObjectAttributes(node.absolutePath, node.schema, defs);
    }

    const graph = new SchemaGraph([], []);

    // We care about titles of nodes that define objects only
    const rootNode = defs.get('')!;
    generateObjectSpecialPropertyEdges(rootNode, defs, graph);
    expect(graph.edges.length).toEqual(2);
    for (const edge of graph.edges) {
      expect(edge.start.absolutePath).toEqual([]);
    }
    //TODO: Maybe I do not have to deal with allOf because all allOfs are merged in beginning?
    expect(graph.edges[0].end.absolutePath).toEqual(['definitions', 'livingBeing']);
    expect(graph.edges[0].edgeType).toEqual(EdgeType.ALL_OF);
    expect(graph.edges[0].label).toEqual('livingBeing');


  });

});
