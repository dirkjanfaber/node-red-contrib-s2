// src/generator/types.ts

export type ControlType = 'OMBC' | 'PEBC' | 'PPBC' | 'FRBC' | 'DDBC';

export interface GeneratedNode {
  js: string;
  html: string;
}

export interface MessageDefinition {
  payload: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface PropertyConfig {
  html: string;
  defaults: string;
  oneditprepare: string;
  oneditsave?: string;
}

export interface AsyncAPISpec {
  channels: {
    default: {
      subscribe: {
        message: {
          oneOf: Array<{$ref: string}>;
        };
      };
      publish: {
        message: {
          oneOf: Array<{$ref: string}>;
        };
      };
    };
  };
  components: {
    schemas: Record<string, any>;
    messages: Record<string, any>;
  };
}