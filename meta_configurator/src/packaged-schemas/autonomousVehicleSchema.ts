import type {TopLevelSchema} from '@/schema/jsonSchemaType';

export const AUTONOMOUS_VEHICLE_SCHEMA: TopLevelSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Self-Driving Vehicle',
  description: 'A JSON schema for configuration of autonomous vehicles',
  type: 'object',
  $defs: {
    Point: {
      title: 'Point in the 2D plane',
      description: 'Position in absolute coordinates',
      type: 'object',
      properties: {
        x: {
          type: 'number',
          description: 'X-coordinate of the starting location.',
        },
        y: {
          type: 'number',
          description: 'Y-coordinate of the starting location.',
        },
      },
      required: ['x', 'y'],
      additionalProperties: false,
    },
    WaypointReference: {
      type: 'string',
      title: 'Name of a waypoint',
      description: 'Must a waypoint defined in the set of waypoints.',
      pattern: '^[A-Z][a-z]+[0-9]*$',
    },
    SensorDefinition: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the radar sensor.',
          pattern: 'Sensor(0[1-9]|1[0-9]|20)$',
          title: 'SensorName',
        },
        type: {
          type: 'string',
          description: 'Type of the sensor.',
          enum: ['radar', 'lidar', 'ultrasonic'],
        },
        range: {
          type: 'number',
          description: 'Maximum range of the sensor. Unit in mm',
          examples: ['400'],
          title: 'SensorRange',
        },
        position: {
          description: "Position of the radar sensor relative to the vehicle's center.",
          $ref: '#/$defs/Point',
          title: 'SensorPosition',
        },
      },
      required: ['name', 'range', 'position'],
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  properties: {
    SimulationName: {
      type: 'string',
      description: 'Name of the simulation.',
      pattern: '^Sim_.',
      title: 'SimulationName',
    },
    SelfDrivingVehicle: {
      type: 'object',
      properties: {
        StartingLocation: {
          title: 'Starting Location',
          description: 'The starting location of the self-driving vehicle.',
          $ref: '#/$defs/Point',
        },
        Destination: {
          title: 'Destination',
          description: 'The destination of the self-driving vehicle.',
          $ref: '#/$defs/Point',
        },
        PlanningAlgorithm: {
          type: 'string',
          description: 'The algorithms used for route planning.',
          enum: ['A* search', 'Dijkstra', 'Rapidly Random Tree (RRT)'],
          title: 'PlanningAlgorithm',
        },
        Sensors: {
          description: 'Set of sensors installed on the self-driving vehicle.',
          type: 'array',
          items: {
            $ref: '#/$defs/SensorDefinition',
          },
        },
        VehicleType: {
          type: 'string',
          description:
            'Levels of the Self-driving vehicle. Level 1 is the lowest level of automation and Level 6 is the highest level of automation.',
          enum: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'],
        },
        PassengerCapacity: {
          type: 'integer',
          description: 'Maximum number of passengers the vehicle can carry.',
          minimum: 1,
          exclusiveMaximum: 10,
          title: 'Passenger capacity',
        },
        MaxSpeed: {
          type: 'integer',
          description: 'Maximum speed of the vehicle. Unit in km/h. Must be a multiple of 10.',
          minimum: 0,
          maximum: 480,
          multipleOf: 10,
        },
        'is4-Wheel-Drive': {
          type: 'boolean',
          description: 'if the car is a 4 wheel driven model',
          title: 'is4-Wheel-Drive',
          default: false,
        },
      },
      required: ['StartingLocation', 'PlanningAlgorithm', 'Sensors', 'VehicleType'],
      title: 'SelfDrivingVehicle',
    },
    Environment: {
      type: 'object',
      properties: {
        Weather: {
          type: 'string',
          description: 'Current weather conditions',
          enum: ['sunny', 'rainy', 'cloudy'],
          title: 'Weather',
        },
        Temperature: {
          type: 'number',
          description: 'Current temperature in Celsius.',
          title: 'Temperature',
        },
        Humidity: {
          type: 'integer',
          description: 'Relative humidity as a percentage.',
          minimum: 0,
          maximum: 100,
          title: 'Humidity',
        },
      },
      required: ['Weather'],
      additionalProperties: {
        type: 'string',
        description: 'Additional environment properties.',
      },
    },
    Vehicles: {
      type: 'object',
      description: 'Set of vehicles.',
      propertyNames: {
        type: 'string',
        minLength: 1,
        maxLength: 20,
        pattern: '^[a-z]+[0-9]*$',
      },
      additionalProperties: {
        type: 'object',
        properties: {
          VehicleType: {
            type: 'string',
            enum: ['car', 'truck', 'bus'],
            description: 'Type of the vehicle.',
            default: 'car',
          },
          PathToDrive: {
            type: 'array',
            description: "List of coordinates representing the vehicle's path.",
            items: {
              $ref: '#/$defs/WaypointReference',
            },
            additionalProperties: false,
            title: 'PathToDrive',
          },
          DrivingSpeed: {
            type: 'number',
            description: 'Average driving speed of the vehicle.',
            minimum: 0,
            maximum: 480,
            multipleOf: 10,
            title: 'Driving Speed',
          },
          IsElectric: {
            type: 'boolean',
            description: 'if the car is an electric model',
            default: false,
          },
          DriverBehavior: {
            type: 'object',
            description: 'Driver behavior of the vehicle.',
            properties: {
              AggressivenessFactor: {
                type: 'number',
                description:
                  'Aggressiveness factor of the driver. This influences e.g. the acceleration and deceleration of the vehicle and the likelihood of overtaking other vehicles.',
                minimum: 0,
                maximum: 1,
              },
              ReactionTime: {
                type: 'number',
                description:
                  'Reaction time of the driver in ms. This influences e.g. the reaction time to obstacles and traffic lights.',
                minimum: 0,
                maximum: 1000,
              },
              Distraction: {
                type: 'number',
                description:
                  'Distraction factor of the driver. This influences e.g. the likelihood of the driver being distracted by a phone call or a passenger.',
                minimum: 0,
                maximum: 1,
              },
              Fatigue: {
                type: 'number',
                description:
                  'Fatigue factor of the driver. This influences e.g. the likelihood of the driver falling asleep.',
                minimum: 0,
                maximum: 1,
              },
            },
          },
        },
        required: ['VehicleType', 'PathToDrive', 'DrivingSpeed'],
        additionalProperties: false,
      },
    },
    PedestrianGroups: {
      type: 'array',
      description: 'Array of pedestrian groups.',
      items: {
        type: 'object',
        properties: {
          Count: {
            type: 'integer',
            description: 'Number of pedestrians.',
            default: 1,
            minimum: 1,
            maximum: 1000,
          },
          Path: {
            type: 'array',
            description: "List of coordinates representing the pedestrian's path.",
            items: {
              $ref: '#/$defs/WaypointReference',
            },
            minItems: 1,
          },
          Speed: {
            type: 'number',
            description: 'Average walking speed of the pedestrians in km/h.',
            minimum: 0,
            maximum: 10,
          },
        },
        additionalProperties: false,
        required: ['Path', 'Speed'],
      },
    },
    Waypoints: {
      type: 'object',
      description:
        'Set of waypoints. Each waypoint is defined by a name and a position. The name must consist of a capital letter followed by at least one lowercase letter and optionally a number.',
      propertyNames: {
        type: 'string',
        minLength: 1,
        maxLength: 20,
        pattern: '^[A-Z][a-z]+[0-9]*$',
      },
      additionalProperties: {
        type: 'object',
        description: 'Position of the waypoint.',
        properties: {
          point: {
            $ref: '#/$defs/Point',
          },
          connectedWaypoints: {
            type: 'array',
            description: 'List of edges connected to the waypoint.',
            items: {
              type: 'string',
              description: 'Name of the connected waypoint.',
              pattern: '^[A-Z][a-z]+[0-9]*$',
            },
          },
          waypointType: {
            type: 'string',
            description: 'Type of the waypoint.',
            enum: [
              'street',
              'sidewalk',
              'bikeLane',
              'trafficLight',
              'stopSign',
              'pedestrianCrossing',
            ],
            default: 'normal',
          },
        },
        required: ['point'],
        additionalProperties: false,
      },
    },
    SimulationSettings: {
      type: 'object',
      properties: {
        Duration: {
          type: 'number',
          description: 'Duration of the simulation in the specified time unit.',
          minimum: 0,
        },
        TimeUnit: {
          type: 'string',
          description: 'Time unit for simulation duration.',
          enum: ['seconds', 'minutes', 'hours'],
        },
      },
      required: ['TimeUnit', 'Duration'],
      additionalProperties: false,
      title: 'Other simulation settings',
    },
  },
};
