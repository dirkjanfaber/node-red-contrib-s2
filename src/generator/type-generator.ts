// src/generator/type-generator.ts

interface SchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  $ref?: string;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

interface Schema {
  type: string;
  properties?: Record<string, SchemaProperty>;
  enum?: string[];
  description?: string;
  required?: string[];
}

function convertType(prop: SchemaProperty): string {
  if (prop.$ref) {
    return prop.$ref.split('/').pop() || 'any';
  }
  
  switch (prop.type) {
    case 'string':
      return prop.enum ? `(${prop.enum.map(e => `'${e}'`).join(' | ')})` : 'string';
    case 'number':
      return 'number';
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return prop.items ? `${convertType(prop.items)}[]` : 'any[]';
    case 'object':
      return generateInterface('', prop);
    default:
      return 'any';
  }
}

function generateInterface(name: string, schema: Schema): string {
  if (schema.enum) {
    return `type ${name} = ${schema.enum.map(e => `'${e}'`).join(' | ')};`;
  }

  if (!schema.properties) {
    return `interface ${name} {}`;
  }

  const props = Object.entries(schema.properties).map(([propName, prop]) => {
    const required = schema.required?.includes(propName);
    return `  ${propName}${required ? '' : '?'}: ${convertType(prop)};`;
  });

  return `interface ${name} {\n${props.join('\n')}\n}`;
}

export function generateTypeScriptTypes(schemas: Record<string, Schema>): string {
  const types = Object.entries(schemas).map(([name, schema]) =>
    generateInterface(name, schema)
  );

  return `// Generated types for S2 protocol
${types.join('\n\n')}

export type MessageType = keyof typeof Messages;
`;
}
