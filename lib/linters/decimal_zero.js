'use strict';

const parser = require('postcss-values-parser');
const util = require('util');

module.exports = {
    name: 'decimalZero',
    nodeTypes: ['decl'],
    message: '%s should be written %s %s zero.',

    lint: function decimalZeroLinter (config, node) {
        const ast = parser(node.value, {
            loose: true
        }).parse();

        const results = [];

        ast.walk((child) => {
            if (child.type !== 'number') {
                return;
            }

            const number = child.value;

            // If it's a float parsed as 0 (e.g. 0.0, .0, 0.), bail.
            if (parseFloat(number) === 0) {
                return;
            }

            const output = {
                inclusion: 'with',
                type: null
            };

            switch (config.style) {
                case 'leading':
                    if (!/^-?(\d+)\.?(\d*)$/.test(number)) {
                        output.type = 'leading';
                    }

                    break;
                case 'trailing':
                    if (!/^-?(\d*)?\.(\d*)$/.test(number)) {
                        output.type = 'trailing';
                    }

                    break;
                case 'both':
                    if (!/^-?(\d+)\.(\d+)$/.test(number)) {
                        output.type = 'leading and trailing';
                    }

                    break;
                case 'none':
                    if (/\./.test(number) && !/^-?([1-9]\d*)?\.(\d*[1-9])$/.test(number)) {
                        output.type = 'leading and trailing';
                        output.inclusion = 'without';
                    }

                    break;
                default:
                    throw new Error(`Invalid setting value for decimalZero: ${ config.style }`);
            }

            if (output.type) {
                results.push({
                    column: node.source.start.column + node.prop.length + node.raws.between.length + child.source.start.column - 1,
                    line: node.source.start.line,
                    message: util.format(this.message, number, output.inclusion, output.type)
                });
            }
        });

        if (results.length > 0) {
            return results;
        }
    }
};
