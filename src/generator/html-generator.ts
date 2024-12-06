// src/generator/html-generator.ts

import type { ControlType, MessageDefinition } from './types';
import { generatePropertiesForControlType } from './properties-generator';
import { generateDetailedHelpText, generatePropertiesHelpText, generateMessageTypesList } from './help-generator';

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

function getIconForControlType(controlType: ControlType): string {
  const icons: Record<ControlType, string> = {
    'OMBC': 'font-awesome/fa-random',
    'PEBC': 'font-awesome/fa-bolt',
    'PPBC': 'font-awesome/fa-area-chart',
    'FRBC': 'font-awesome/fa-battery-half',
    'DDBC': 'font-awesome/fa-tachometer'
  };
  return icons[controlType];
}

export function generateNodeHtml(
  controlType: ControlType,
  messages: Record<string, MessageDefinition>
): string {
  const properties = generatePropertiesForControlType(controlType);
  const category = 'S2 Protocol';
  const color = getColorForControlType(controlType);
  const icon = getIconForControlType(controlType);

  return `
<script type="text/html" data-template-name="s2-rm-${controlType.toLowerCase()}">
    <div class="form-row">
        <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
        <input type="text" id="node-input-name" placeholder="Name">
    </div>
    <div class="form-row">
        <label for="node-input-resourceId"><i class="fa fa-id-card"></i> Resource ID</label>
        <input type="text" id="node-input-resourceId" placeholder="${controlType.toLowerCase()}-unique-id">
        <div class="form-tips">A unique identifier for this resource manager.</div>
    </div>
    ${properties.html}
</script>

<script type="text/html" data-help-name="s2-rm-${controlType.toLowerCase()}">
    <p>A Resource Manager node implementing the ${controlType} control type of the S2 protocol.</p>
    
    ${generateDetailedHelpText(controlType)}

    <h3>Properties</h3>
    ${generatePropertiesHelpText(controlType)}

    <h3>Inputs</h3>
    <dl class="message-properties">
        <dt>payload
            <span class="property-type">object</span>
        </dt>
        <dd>The S2 protocol message object. Must include a <code>message_type</code> field.</dd>
    </dl>

    <h3>Outputs</h3>
    <dl class="message-properties">
        <dt>payload <span class="property-type">object</span></dt>
        <dd>The response message conforming to the S2 protocol.</dd>
    </dl>

    <h3>Details</h3>
    <p>This node implements the S2 protocol Resource Manager for ${controlType} control type. 
    It handles the following message types:</p>
    <ul>
        ${generateMessageTypesList(messages)}
    </ul>

    <h3>Status</h3>
    <ul>
        <li><i class="fa fa-circle"></i> Grey - Waiting for input</li>
        <li><i class="fa fa-circle"></i> Blue - Processing message</li>
        <li><i class="fa fa-circle"></i> Green - Successfully processed</li>
        <li><i class="fa fa-circle-thin"></i> Red - Error occurred</li>
    </ul>
</script>

<script type="text/javascript">
    RED.nodes.registerType('s2-rm-${controlType.toLowerCase()}',{
        category: '${category}',
        color: '${color}',
        defaults: {
            name: { value: "" },
            resourceId: { 
                value: "", 
                required: true,
                validate: function(v) { 
                    return v && v.length > 0;
                }
            },
            ${properties.defaults}
        },
        inputs: 1,
        outputs: 1,
        icon: "${icon}",
        label: function() {
            return this.name || "S2 ${controlType} RM";
        },
        labelStyle: function() {
            return this.name ? "node_label_italic" : "";
        },
        oneditprepare: function() {
            ${properties.oneditprepare}
        },
        oneditsave: function() {
            ${properties.oneditsave || ''}
        }
    });
</script>`;
}