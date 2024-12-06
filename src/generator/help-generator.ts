// src/generator/help-generator.ts

import type { ControlType, MessageDefinition } from './types';

export function generateDetailedHelpText(controlType: ControlType): string {
  const descriptions: Record<ControlType, string> = {
    'OMBC': `
    <p>Operation Mode Based Control (OMBC) allows external control of device operation modes. 
    This node helps manage:</p>
    <ul>
        <li>Different operation modes of the device</li>
        <li>Transitions between modes</li>
        <li>Timing constraints for mode changes</li>
    </ul>
    <p>Typical use cases include managing:</p>
    <ul>
        <li>HVAC systems with multiple operation modes</li>
        <li>Industrial equipment with different working states</li>
        <li>Smart appliances with various programs</li>
    </ul>
    
    <h4>Configuration Example:</h4>
    <pre>
// Operation Modes:
[
  {
    "mode_id": "standby",
    "description": "Low power standby mode",
    "power_range": {"min": 5, "max": 10}
  },
  {
    "mode_id": "active",
    "description": "Normal operation mode",
    "power_range": {"min": 100, "max": 200}
  }
]

// Transitions:
[
  {
    "from_mode": "standby",
    "to_mode": "active",
    "min_duration": 30
  }
]</pre>`,
    
    'PEBC': `
    <p>Power Envelope Based Control (PEBC) manages power consumption within defined limits.
    This node helps control:</p>
    <ul>
        <li>Power consumption boundaries</li>
        <li>Dynamic power adjustments</li>
        <li>Load balancing</li>
    </ul>
    <p>Typical use cases:</p>
    <ul>
        <li>Grid-connected devices with power constraints</li>
        <li>Energy management systems</li>
        <li>Demand response programs</li>
    </ul>
    
    <h4>Configuration Example:</h4>
    <pre>
// Power Limit Ranges:
[
  {
    "time_period": {"start": "09:00", "end": "17:00"},
    "power_range": {"min": 0, "max": 1000}
  }
]</pre>`,
    
    'PPBC': `
    <p>Power Profile Based Control (PPBC) handles power profiles for planned operations.
    Key features:</p>
    <ul>
        <li>Scheduled power consumption patterns</li>
        <li>Predictable operation sequences</li>
        <li>Time-based power management</li>
    </ul>
    <p>Typical applications:</p>
    <ul>
        <li>Washing machines and dishwashers</li>
        <li>Industrial processes with fixed sequences</li>
        <li>Batch processing equipment</li>
    </ul>
    
    <h4>Configuration Example:</h4>
    <pre>
// Power Sequences:
[
  {
    "sequence_id": "wash_cycle",
    "steps": [
      {"duration": 600, "power": 2000},
      {"duration": 1800, "power": 500}
    ]
  }
]</pre>`,
    
    'FRBC': `
    <p>Fill Rate Based Control (FRBC) manages storage systems like batteries.
    Key aspects:</p>
    <ul>
        <li>State of charge management</li>
        <li>Charging/discharging rates</li>
        <li>Storage capacity constraints</li>
    </ul>
    <p>Common applications:</p>
    <ul>
        <li>Battery storage systems</li>
        <li>Thermal storage units</li>
        <li>Water storage tanks</li>
    </ul>
    
    <h4>Configuration Example:</h4>
    <pre>
// Storage Configuration:
{
  "capacity": 10000,
  "max_charge_rate": 2000,
  "max_discharge_rate": 2000
}

// Actuators:
[
  {
    "id": "inverter_1",
    "type": "bidirectional",
    "power_range": {"min": -2000, "max": 2000}
  }
]</pre>`,
    
    'DDBC': `
    <p>Demand Driven Based Control (DDBC) handles on-demand power requirements.
    Main features:</p>
    <ul>
        <li>Real-time power demand handling</li>
        <li>Variable rate control</li>
        <li>Demand-based optimization</li>
    </ul>
    <p>Typical use cases:</p>
    <ul>
        <li>Heat pumps</li>
        <li>Variable speed drives</li>
        <li>Demand-controlled ventilation</li>
    </ul>
    
    <h4>Configuration Example:</h4>
    <pre>
// Demand Rate Configuration:
{
  "min_rate": 0,
  "max_rate": 5000,
  "ramp_rate": 1000
}

// Actuators:
[
  {
    "id": "pump_1",
    "type": "variable",
    "power_range": {"min": 0, "max": 5000}
  }
]</pre>`
  };

  return descriptions[controlType] || '';
}

export function generatePropertiesHelpText(controlType: ControlType): string {
  const descriptions: Record<ControlType, string> = {
    'OMBC': `
    <dl class="message-properties">
        <dt>Operation Modes <span class="property-type">array</span></dt>
        <dd>List of possible operation modes for the device. Each mode should include:
            <ul>
                <li>mode_id: Unique identifier for the mode</li>
                <li>description: Human-readable description</li>
                <li>power_range: Expected power consumption range</li>
            </ul>
        </dd>
        <dt>Transitions <span class="property-type">array</span></dt>
        <dd>Defines allowed transitions between modes:
            <ul>
                <li>from_mode: Source mode ID</li>
                <li>to_mode: Target mode ID</li>
                <li>constraints: Optional transition constraints</li>
            </ul>
        </dd>
    </dl>`,

    'PEBC': `
    <dl class="message-properties">
        <dt>Power Limit Ranges <span class="property-type">array</span></dt>
        <dd>Defines the allowable power ranges:
            <ul>
                <li>time_period: Optional time constraints</li>
                <li>power_range: Power limits (min/max)</li>
                <li>ramp_limits: Optional rate of change constraints</li>
            </ul>
        </dd>
    </dl>`,

    'PPBC': `
    <dl class="message-properties">
        <dt>Power Sequences <span class="property-type">array</span></dt>
        <dd>Defines power consumption sequences:
            <ul>
                <li>sequence_id: Unique sequence identifier</li>
                <li>steps: Array of power levels and durations</li>
                <li>constraints: Optional sequence constraints</li>
            </ul>
        </dd>
    </dl>`,

    'FRBC': `
    <dl class="message-properties">
        <dt>Storage Configuration <span class="property-type">object</span></dt>
        <dd>Defines storage system parameters:
            <ul>
                <li>capacity: Total storage capacity</li>
                <li>max_charge_rate: Maximum charging rate</li>
                <li>max_discharge_rate: Maximum discharge rate</li>
            </ul>
        </dd>
        <dt>Actuators <span class="property-type">array</span></dt>
        <dd>List of actuators that can affect storage:
            <ul>
                <li>id: Unique actuator identifier</li>
                <li>type: Actuator type (e.g., unidirectional, bidirectional)</li>
                <li>power_range: Operating power range</li>
            </ul>
        </dd>
    </dl>`,

    'DDBC': `
    <dl class="message-properties">
        <dt>Demand Rate <span class="property-type">object</span></dt>
        <dd>Defines demand rate parameters:
            <ul>
                <li>min_rate: Minimum allowable rate</li>
                <li>max_rate: Maximum allowable rate</li>
                <li>ramp_rate: Maximum rate of change</li>
            </ul>
        </dd>
        <dt>Actuators <span class="property-type">array</span></dt>
        <dd>List of demand-responsive actuators:
            <ul>
                <li>id: Unique actuator identifier</li>
                <li>type: Actuator type</li>
                <li>power_range: Operating power range</li>
            </ul>
        </dd>
    </dl>`
  };

  return descriptions[controlType] || '';
}

export function generateMessageTypesList(messages: Record<string, MessageDefinition>): string {
  return Object.keys(messages)
    .map(name => `<li><code>${name}</code></li>`)
    .join('\n        ');
}