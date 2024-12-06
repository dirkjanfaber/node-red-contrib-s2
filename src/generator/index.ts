// src/generator/index.ts
const fs = require('fs/promises');
const path = require('path');
const { parse } = require('yaml');
const { generateTypeScriptTypes } = require('./type-generator');
const { generateNodeDefinition } = require('./node-generator');
import type { AsyncAPISpec, ControlType } from './types';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const PROTOCOL_DIR = path.join(PROJECT_ROOT, 'ext/s2-ws-jsone/s2-asyncapi');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src/nodes');
const TYPES_DIR = path.join(PROJECT_ROOT, 'src/types');

async function readYamlFile(filePath: string): Promise<AsyncAPISpec> {
  const content = await fs.readFile(filePath, 'utf-8');
  return parse(content) as AsyncAPISpec;
}

function isControlType(type: string): type is ControlType {
  return ['OMBC', 'PEBC', 'PPBC', 'FRBC', 'DDBC'].includes(type);
}

function groupMessagesByControlType(messages: Record<string, any>): Record<ControlType | 'BASE', any> {
  const groups: Record<ControlType | 'BASE', any> = {
    'BASE': {},
    'OMBC': {},
    'PEBC': {},
    'PPBC': {},
    'FRBC': {},
    'DDBC': {}
  };

  for (const [name, message] of Object.entries(messages)) {
    const prefix = name.split('.')[0];
    if (isControlType(prefix)) {
      groups[prefix][name] = message;
    } else {
      groups['BASE'][name] = message;
    }
  }

  return groups;
}

async function generateNodes(spec: AsyncAPISpec): Promise<void> {
  // Generate base types used by all nodes
  const baseTypes = generateTypeScriptTypes(spec.components.schemas);
  await fs.writeFile(path.join(TYPES_DIR, 'base.types.ts'), baseTypes);

  // Group messages by control type
  const messageGroups = groupMessagesByControlType(spec.components.messages);

  // Generate node for each control type
  for (const [controlType, messages] of Object.entries(messageGroups)) {
    if (controlType === 'BASE') continue;  // Skip base messages
    
    if (!isControlType(controlType)) {
      console.warn(`Skipping unknown control type: ${controlType}`);
      continue;
    }

    // Generate specific types for this control type
    const typesDefs = generateTypeScriptTypes({
      ...spec.components.schemas,
      messages: messages
    });
    await fs.writeFile(
      path.join(TYPES_DIR, `${controlType.toLowerCase()}.types.ts`),
      typesDefs
    );

    // Generate Node-RED node definition
    const nodeDef = generateNodeDefinition(spec, controlType, messages);
    await fs.writeFile(
      path.join(OUTPUT_DIR, `s2-rm-${controlType.toLowerCase()}.js`),
      nodeDef.js
    );
    await fs.writeFile(
      path.join(OUTPUT_DIR, `s2-rm-${controlType.toLowerCase()}.html`),
      nodeDef.html
    );
  }
}

async function main(): Promise<void> {
  try {
    // Ensure output directories exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(TYPES_DIR, { recursive: true });

    // Read and parse main spec file
    const spec = await readYamlFile(path.join(PROTOCOL_DIR, 's2-rm.yaml'));
    
    // Generate nodes
    await generateNodes(spec);
    
    console.log('Generation complete!');
  } catch (error) {
    console.error('Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);