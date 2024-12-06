// src/generator/node-generator.ts

import type { ControlType, GeneratedNode, MessageDefinition } from './types';
import { generateNodeHtml } from './html-generator';
import { generateNodeImplementation } from './implementation-generator';

export function generateNodeDefinition(
  spec: any, 
  controlType: ControlType,
  messages: Record<string, MessageDefinition>
): GeneratedNode {
  return {
    js: generateNodeImplementation(controlType, messages),
    html: generateNodeHtml(controlType, messages)
  };
}

// Export other necessary functions if needed
export { isControlType } from './utils';