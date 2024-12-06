// src/generator/node-generator.ts

import { Node, NodeDef } from 'node-red';

export type ControlType = 'OMBC' | 'PEBC' | 'PPBC' | 'FRBC' | 'DDBC';

export interface GeneratedNode {
  js: string;
  html: string;
}

interface MessageDefinition {
  payload: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

function isControlType(type: string): type is ControlType {
  return ['OMBC', 'PEBC', 'PPBC', 'FRBC', 'DDBC'].includes(type);
}

function getMessageControlType(name: string): ControlType | null {
  const prefix = name.split('.')[0] as string;
  return isControlType(prefix) ? prefix : null;
}

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

function generateNodeImplementation(
  controlType: ControlType,
  messages: Record<string, MessageDefinition>
): string {
  const controlMessages = Object.entries(messages)
    .filter(([name]) => name.startsWith(controlType));
  
  return `
module.exports = function(RED) {
    function S2${controlType}Node(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.resourceId = config.resourceId || \`${controlType.toLowerCase()}-\${Date.now()}\`;
        node.currentState = {};

        node.on('input', function(msg) {
            const messageType = msg.payload?.message_type;
            
            switch(messageType) {
                ${generateMessageHandlers(controlMessages)}
                default:
                    node.error(\`Unsupported message type: \${messageType}\`);
            }
        });

        ${generateInitialSetup(controlType)}
    }

    RED.nodes.registerType("s2-rm-${controlType.toLowerCase()}", S2${controlType}Node);
}`;
}

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

function generateNodeHtml(
  controlType: ControlType,
  messages: Record<string, MessageDefinition>
): string {
  const properties = generatePropertiesForControlType(controlType);
  const category = 'S2 Protocol';
  const color = getColorForControlType(controlType);

  return `
<script type="text/html" data-template-name="s2-rm-${controlType.toLowerCase()}">
    <div class="form-row">
        <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
        <input type="text" id="node-input-name" placeholder="Name">
    </div>
    <div class="form-row">
        <label for="node-input-resourceId"><i class="fa fa-id-card"></i> Resource ID</label>
        <input type="text" id="node-input-resourceId" placeholder="Resource ID">
    </div>
    ${properties.html}
</script>

<script type="text/html" data-help-name="s2-rm-${controlType.toLowerCase()}">
    <p>A Resource Manager node implementing the ${controlType} control type of the S2 protocol.</p>
    ${generateHelpText(controlType)}
</script>

<script type="text/javascript">
    RED.nodes.registerType('s2-rm-${controlType.toLowerCase()}',{
        category: '${category}',
        color: '${color}',
        defaults: {
            name: { value: "" },
            resourceId: { value: "", required: true },
            ${properties.defaults}
        },
        inputs:1,
        outputs:1,
        icon: "s2.png",
        label: function() {
            return this.name || "S2 ${controlType} RM";
        },
        oneditprepare: function() {
            ${properties.oneditprepare}
        }
    });
</script>`;
}

function generatePropertiesForControlType(controlType: ControlType): {
  html: string;
  defaults: string;
  oneditprepare: string;
} {
  switch(controlType) {
    case 'OMBC':
      return {
        html: `
    <div class="form-row">
        <label for="node-input-operationModes"><i class="fa fa-list"></i> Operation Modes</label>
        <input type="text" id="node-input-operationModes">
    </div>
    <div class="form-row">
        <label for="node-input-transitions"><i class="fa fa-random"></i> Transitions</label>
        <input type="text" id="node-input-transitions">
    </div>`,
        defaults: `
            operationModes: { value: [], required: true },
            transitions: { value: [] },
            timers: { value: [] }`,
        oneditprepare: `
            $('#node-input-operationModes').typedInput({
                type: 'json',
                types: ['json']
            });
            $('#node-input-transitions').typedInput({
                type: 'json',
                types: ['json']
            });`
      };
    
    case 'PEBC':
      return {
        html: `
    <div class="form-row">
        <label for="node-input-limitRanges"><i class="fa fa-bars"></i> Limit Ranges</label>
        <input type="text" id="node-input-limitRanges">
    </div>`,
        defaults: `
            limitRanges: { value: [], required: true },
            consequenceType: { value: "DEFER" }`,
        oneditprepare: `
            $('#node-input-limitRanges').typedInput({
                type: 'json',
                types: ['json']
            });`
      };

    case 'PPBC':
      return {
        html: `
    <div class="form-row">
        <label for="node-input-sequences"><i class="fa fa-list-ol"></i> Sequences</label>
        <input type="text" id="node-input-sequences">
    </div>`,
        defaults: `
            sequences: { value: [], required: true }`,
        oneditprepare: `
            $('#node-input-sequences').typedInput({
                type: 'json',
                types: ['json']
            });`
      };

    case 'FRBC':
      return {
        html: `
    <div class="form-row">
        <label for="node-input-storage"><i class="fa fa-database"></i> Storage</label>
        <input type="text" id="node-input-storage">
    </div>
    <div class="form-row">
        <label for="node-input-actuators"><i class="fa fa-cogs"></i> Actuators</label>
        <input type="text" id="node-input-actuators">
    </div>`,
        defaults: `
            storage: { value: {}, required: true },
            actuators: { value: [], required: true }`,
        oneditprepare: `
            $('#node-input-storage').typedInput({
                type: 'json',
                types: ['json']
            });
            $('#node-input-actuators').typedInput({
                type: 'json',
                types: ['json']
            });`
      };

    case 'DDBC':
      return {
        html: `
    <div class="form-row">
        <label for="node-input-demandRate"><i class="fa fa-tachometer"></i> Demand Rate</label>
        <input type="text" id="node-input-demandRate">
    </div>
    <div class="form-row">
        <label for="node-input-actuators"><i class="fa fa-cogs"></i> Actuators</label>
        <input type="text" id="node-input-actuators">
    </div>`,
        defaults: `
            demandRate: { value: {}, required: true },
            actuators: { value: [], required: true }`,
        oneditprepare: `
            $('#node-input-demandRate').typedInput({
                type: 'json',
                types: ['json']
            });
            $('#node-input-actuators').typedInput({
                type: 'json',
                types: ['json']
            });`
      };
  }
}

function generateHelpText(controlType: ControlType): string {
  const descriptions: Record<ControlType, string> = {
    'OMBC': 'Operation Mode Based Control allows external control of device operation modes.',
    'PEBC': 'Power Envelope Based Control manages power consumption within defined limits.',
    'PPBC': 'Power Profile Based Control handles power profiles for planned operations.',
    'FRBC': 'Fill Rate Based Control manages storage systems like batteries.',
    'DDBC': 'Demand Driven Based Control handles on-demand power requirements.'
  };

  return `<p>${descriptions[controlType]}</p>
<h3>Inputs</h3>
<dl class="message-properties">
    <dt>payload
        <span class="property-type">object</span>
    </dt>
    <dd>The S2 protocol message object.</dd>
</dl>`;
}

function getColorForControlType(controlType: ControlType): string {
  const colors: Record<ControlType, string> = {
    'OMBC': '#87A980',
    'PEBC': '#A9A980',
    'PPBC': '#A98087',
    'FRBC': '#80A987',
    'DDBC': '#8780A9'
  };
  return colors[controlType];
}
