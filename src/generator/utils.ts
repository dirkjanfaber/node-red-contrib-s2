// src/generator/utils.ts

import type { ControlType } from './types';

export function isControlType(type: string): type is ControlType {
  return ['OMBC', 'PEBC', 'PPBC', 'FRBC', 'DDBC'].includes(type);
}

export function getMessageControlType(name: string): ControlType | null {
  const prefix = name.split('.')[0] as string;
  return isControlType(prefix) ? prefix : null;
}