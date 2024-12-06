// src/generator/properties-generator.ts

import type { ControlType, PropertyConfig } from './types';

export function generatePropertiesForControlType(controlType: ControlType): PropertyConfig {
  switch(controlType) {
    case 'OMBC':
      return {
        html: `
    <div class="form-row">
        <label for="node-input-operationModes"><i class="fa fa-list"></i> Operation Modes</label>
        <input type="text" id="node-input-operationModes">
        <div class="form-tips">Define the available operation modes for your device. Format: JSON array of mode objects.</div>
    </div>
    <div class="form-row">
        <label for="node-input-transitions"><i class="fa fa-random"></i> Allowed Transitions</label>
        <input type="text" id="node-input-transitions">
        <div class="form-tips">Define which mode transitions are allowed. Format: JSON array of transition objects.</div>
    </div>`,
        defaults: `
            operationModes: { 
                value: [], 
                required: true,
                validate: function(v) {
                    try {
                        const modes = JSON.parse(v);
                        return Array.isArray(modes) && modes.length > 0;
                    } catch(e) {
                        return false;
                    }
                }
            },
            transitions: { 
                value: [],
                validate: function(v) {
                    try {
                        const trans = JSON.parse(v);
                        return Array.isArray(trans);
                    } catch(e) {
                        return false;
                    }
                }
            },
            timers: { value: [] }`,
        oneditprepare: `
            // Initialize JSON input fields
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
        <label for="node-input-limitRanges"><i class="fa fa-bars"></i> Power Limit Ranges</label>
        <input type="text" id="node-input-limitRanges">
        <div class="form-tips">Define the allowable power ranges. Format: JSON array of range objects with min/max values.</div>
    </div>`,
        defaults: `
            limitRanges: { 
                value: [], 
                required: true,
                validate: function(v) {
                    try {
                        const ranges = JSON.parse(v);
                        return Array.isArray(ranges) && ranges.length > 0;
                    } catch(e) {
                        return false;
                    }
                }
            },
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
        <label for="node-input-sequences"><i class="fa fa-list-ol"></i> Power Sequences</label>
        <input type="text" id="node-input-sequences">
        <div class="form-tips">Define power consumption sequences. Format: JSON array of sequence objects with timestamped power values.</div>
    </div>`,
        defaults: `
            sequences: { 
                value: [], 
                required: true,
                validate: function(v) {
                    try {
                        const seq = JSON.parse(v);
                        return Array.isArray(seq) && seq.length > 0;
                    } catch(e) {
                        return false;
                    }
                }
            }`,
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
        <label for="node-input-storage"><i class="fa fa-database"></i> Storage Configuration</label>
        <input type="text" id="node-input-storage">
        <div class="form-tips">Define storage system parameters. Format: JSON object with capacity and constraints.</div>
    </div>
    <div class="form-row">
        <label for="node-input-actuators"><i class="fa fa-cogs"></i> Actuators</label>
        <input type="text" id="node-input-actuators">
        <div class="form-tips">Define actuator configurations. Format: JSON array of actuator objects.</div>
    </div>`,
        defaults: `
            storage: { 
                value: {}, 
                required: true,
                validate: function(v) {
                    try {
                        return typeof JSON.parse(v) === 'object';
                    } catch(e) {
                        return false;
                    }
                }
            },
            actuators: { 
                value: [], 
                required: true,
                validate: function(v) {
                    try {
                        const act = JSON.parse(v);
                        return Array.isArray(act) && act.length > 0;
                    } catch(e) {
                        return false;
                    }
                }
            }`,
        oneditprepare: `
            $('#node-input-storage').typedInput({
                type: 'json',
                types: ['json']
            });
            $('#node-input-actuators').typedInput({
                type: 'json',
                types: ['json']
            });`,
        oneditsave: `
            // Additional validation could be added here
            `
      };

    case 'DDBC':
      return {
        html: `
    <div class="form-row">
        <label for="node-input-demandRate"><i class="fa fa-tachometer"></i> Demand Rate</label>
        <input type="text" id="node-input-demandRate">
        <div class="form-tips">Define demand rate parameters. Format: JSON object with rate limits and thresholds.</div>
    </div>
    <div class="form-row">
        <label for="node-input-actuators"><i class="fa fa-cogs"></i> Actuators</label>
        <input type="text" id="node-input-actuators">
        <div class="form-tips">Define actuator configurations. Format: JSON array of actuator objects.</div>
    </div>`,
        defaults: `
            demandRate: { 
                value: {}, 
                required: true,
                validate: function(v) {
                    try {
                        return typeof JSON.parse(v) === 'object';
                    } catch(e) {
                        return false;
                    }
                }
            },
            actuators: { 
                value: [], 
                required: true,
                validate: function(v) {
                    try {
                        const act = JSON.parse(v);
                        return Array.isArray(act) && act.length > 0;
                    } catch(e) {
                        return false;
                    }
                }
            }`,
        oneditprepare: `
            $('#node-input-demandRate').typedInput({
                type: 'json',
                types: ['json']
            });
            $('#node-input-actuators').typedInput({
                type: 'json',
                types: ['json']
            });`,
        oneditsave: `
            // Additional validation could be added here
            `
      };
  }
}