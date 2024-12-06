// src/generator/implementation-generator.ts

import type { ControlType, MessageDefinition } from './types';
import { isControlType, getMessageControlType } from './utils';

function generateMessageHandlers(messages: [string, MessageDefinition][]): string {
  return messages
    .filter(([name]) => getMessageControlType(name) !== null)
    .map(([name]) => `
                case "${name}":
                    handle${name.replace(/\./g, '_')}(node, msg.payload);
                    break;`
    ).join('\n');
}

function generateInitialSetup(controlType: ControlType): string {
  switch(controlType) {
    case 'OMBC':
      return `
        const systemDescription = {
            message_type: "OMBC.SystemDescription",
            message_id: \`sd-\${Date.now()}\`,
            valid_from: new Date().toISOString(),
            operation_modes: config.operationModes || [],
            transitions: config.transitions || [],
            timers: config.timers || []
        };
        node.send({ payload: systemDescription });`;
    
    case 'PEBC':
      return `
        const powerConstraints = {
            message_type: "PEBC.PowerConstraints",
            message_id: \`pc-\${Date.now()}\`,
            valid_from: new Date().toISOString(),
            allowed_limit_ranges: config.limitRanges || []
        };
        node.send({ payload: powerConstraints });`;
    
    default:
      return '// No initial setup required';
  }
}

export function generateNodeImplementation(
  controlType: ControlType,
  messages: Record<string, MessageDefinition>
): string {
  const controlMessages = Object.entries(messages)
    .filter(([name]) => name.startsWith(controlType));
  
  return `'use strict';

module.exports = function(RED) {
    function S2${controlType}Node(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.resourceId = config.resourceId || \`${controlType.toLowerCase()}-\${Date.now()}\`;
        node.currentState = {};

        // Status update helper
        function updateStatus(message, type = 'grey') {
            const shape = type === 'error' ? 'ring' : 'dot';
            node.status({ fill: type, shape: shape, text: message });
        }

        // Initial status
        updateStatus('Waiting for input');

        // Input validation helper
        function validateInput(msg) {
            if (!msg.payload) {
                throw new Error('Message has no payload');
            }
            if (!msg.payload.message_type) {
                throw new Error('Message type not specified');
            }
            return true;
        }

        node.on('input', function(msg) {
            try {
                // Validate input
                validateInput(msg);
                
                const messageType = msg.payload.message_type;
                updateStatus(\`Processing \${messageType}\`, 'blue');
                
                switch(messageType) {
                    ${generateMessageHandlers(controlMessages)}
                    default:
                        throw new Error(\`Unsupported message type: \${messageType}\`);
                }
                
                // Update status on successful processing
                updateStatus('Last message processed successfully', 'green');
            } catch (error) {
                // Handle errors gracefully
                node.error(error.message, msg);
                updateStatus(error.message, 'error');
            }
        });

        // Initial setup
        try {
            ${generateInitialSetup(controlType)}
            updateStatus('Initialized successfully', 'green');
        } catch (error) {
            node.error('Initialization failed: ' + error.message);
            updateStatus('Initialization failed', 'error');
        }
    }

    RED.nodes.registerType("s2-rm-${controlType.toLowerCase()}", S2${controlType}Node);
}`;
}