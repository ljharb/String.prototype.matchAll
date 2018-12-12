'use strict';

require('es5-shim');
require('es6-shim');
var matchAllShim = require('../');
matchAllShim.shim();

var test = require('tape');
var defineProperties = require('define-properties');
var bind = require('function-bind');
var hasSymbols = require('has-symbols')();
var regexMatchAll = require('../regexp-matchall');

var isEnumerable = Object.prototype.propertyIsEnumerable;
var functionsHaveNames = function f() {}.name === 'f';
var functionNamesConfigurable = functionsHaveNames
	&& Object.getOwnPropertyDescriptor
	&& Object.getOwnPropertyDescriptor(function () {}, 'name').configurable;

var runTests = require('./tests');

test('shimmed', function (t) {
	t.equal(String.prototype.matchAll.length, 1, 'String#matchAll has a length of 1');
	t.test('Function name', { skip: !functionsHaveNames }, function (st) {
		st.equal(String.prototype.matchAll.name, 'matchAll', 'String#matchAll has name "matchAll"');
		st.end();
	});

	t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
		et.equal(false, isEnumerable.call(String.prototype, 'matchAll'), 'String#matchAll is not enumerable');
		et.end();
	});

	t.test('Symbol.matchAll', { skip: !hasSymbols }, function (st) {
		st.equal(typeof Symbol.matchAll, 'symbol', 'Symbol.matchAll is a symbol');

		st.equal(typeof RegExp.prototype[Symbol.matchAll], 'function', 'Symbol.matchAll function is on RegExp.prototype');

		st.test('Function name', { skip: !functionsHaveNames }, function (s2t) {
			if (functionNamesConfigurable) {
				s2t.equal(RegExp.prototype[Symbol.matchAll].name, '[Symbol.matchAll]', 'RegExp.prototype[Symbol.matchAll] has name "[Symbol.matchAll]"');
			} else {
				s2t.equal(RegExp.prototype[Symbol.matchAll].name, 'SymbolMatchAll', 'RegExp.prototype[Symbol.matchAll] has best guess name "SymbolMatchAll"');
			}
			s2t.end();
		});

		st.test('no symbol present', function (s2t) {
			var desc = Object.getOwnPropertyDescriptor(RegExp.prototype, Symbol.matchAll);

			s2t.doesNotThrow(function () { 'abc'.matchAll('b'); }, 'does not throw on string input, with the symbol on regex prototype');

			// eslint-disable-next-line no-extend-native
			Object.defineProperty(RegExp.prototype, Symbol.matchAll, {
				configurable: true,
				enumerable: false,
				value: undefined,
				writable: true
			});

			s2t['throws'](function () { 'abc'.matchAll('b'); }, 'throws on string input, without the symbol on regex prototype');

			// eslint-disable-next-line no-extend-native
			Object.defineProperty(RegExp.prototype, Symbol.matchAll, desc);

			s2t.end();
		});

		st.end();
	});

	runTests(
		bind.call(Function.call, String.prototype.matchAll),
		bind.call(Function.call, hasSymbols ? RegExp.prototype[Symbol.matchAll] : regexMatchAll),
		t
	);

	t.end();
});
