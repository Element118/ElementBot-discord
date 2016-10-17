module.exports = {};
var evaluationMemory = {};
var safeLimit = 256;
var safeString = function(a) {
	return a.toString().substring(0, safeLimit);
};
var safeFunctions = module.exports.safeFunctions = {
	"+": { arity: 2, run: function(a, b) { return a+b; }, toString: function() { return "add"; } },
	"-": { arity: 2, run: function(a, b) { return a-b; }, toString: function() { return "subtract"; } },
	"*": { arity: 2, run: function(a, b) { return a*b; }, toString: function() { return "multiply"; } },
	"/": { arity: 2, run: function(a, b) { return a/b; }, toString: function() { return "divide"; } },
	"%": { arity: 2, run: function(a, b) { return a%b; }, toString: function() { return "modulus"; } },
	"^": { arity: 2, run: function(a, b) { return a^b; }, toString: function() { return "xor"; } },
	"&": { arity: 2, run: function(a, b) { return a&b; }, toString: function() { return "bitwise and"; } },
	"|": { arity: 2, run: function(a, b) { return a|b; }, toString: function() { return "bitwise or"; } },
	"!": { arity: 1, run: function(a) { return !a; }, toString: function() { return "logical not"; } },
	"~": { arity: 1, run: function(a) { return ~a; }, toString: function() { return "bitwise not"; } },
	"substring": { arity: 3, run: function(a, b, c) { return safeString(a).substring(b, c); }, toString: function() { return "substring"; } },
	"substr": { arity: 3, run: function(a, b, c) { return safeString(a).substr(b, c); }, toString: function() { return "substr"; } },
	"charAt": { arity: 2, run: function(a, b) { return safeString(a).charAt(b); }, toString: function() { return "charAt"; } },
	"charCodeAt": { arity: 2, run: function(a, b) { return safeString(a).charCodeAt(b); }, toString: function() { return "charCodeAt"; } },
	"concat": { arity: 2, run: function(a, b) { return safeString(a).concat(safeString(b)).substring(0, safeLimit); }, toString: function() { return "concat"; } },
	"endsWith": { arity: 2, run: function(a, b) { return safeString(a).endsWith(safeString(b)); }, toString: function() { return "endsWith"; } },
	"startsWith": { arity: 2, run: function(a, b) { return safeString(a).startsWith(safeString(b)); }, toString: function() { return "startsWith"; } },
	"includes": { arity: 2, run: function(a, b) { return safeString(a).includes(safeString(b)); }, toString: function() { return "includes"; } },
	"indexOf": { arity: 2, run: function(a, b) { return safeString(a).indexOf(safeString(b)); }, toString: function() { return "includes"; } },
	"lastIndexOf": { arity: 2, run: function(a, b) { return safeString(a).lastIndexOf(safeString(b)); }, toString: function() { return "includes"; } },
	"match": { arity: 2, run: function(a, b) { return safeString(a).match(b); }, toString: function() { return "includes"; } },
	"repeat": { arity: 2, run: function(a, b) {
		a = safeString(a); // even repeating a number must be done safely.
		if (isNaN(b)) return a;
		b = Math.min(+b, Math.ceil(safeLimit/a.length));
		return a.repeat(b).substring(0, safeLimit);
	}, toString: function() { return "repeat"; } },
	"replace": { arity: 3, run: function(a, b, c) {
		return a.toString().replace(b, c).substring(0, safeLimit);
	}, toString: function() { return "replace"; } },
	"search": { arity: 2, run: function(a, b) { return safeString(a).search(safeString(b)); }, toString: function() { return "search"; } },
	"slice": { arity: 3, run: function(a, b, c) {
		if (a.constructor === Array) {
			return a.slice(b, c);
		} else {
			return safeString(a).slice(b, c);
		}
	}, toString: function() { return "slice"; } },
	"split": { arity: 2, run: function(a, b) { return safeString(a).split(safeString(b)); }, toString: function() { return "split"; } },
	"toLowerCase": { arity: 1, run: function(a) { return safeString(a).toLowerCase(); }, toString: function() { return "toLowerCase"; } },
	"toUpperCase": { arity: 1, run: function(a) { return safeString(a).toLowerCase(); }, toString: function() { return "toUpperCase"; } },
	"trim": { arity: 1, run: function(a) { return safeString(a).trim(); }, toString: function() { return "trim"; } },
	"true": { arity: 0, run: function() { return true; }, valueOf: function() { return 1; }, toString: function() { return "true"; } },
	"false": { arity: 0, run: function() { return false; }, valueOf: function() { return 0; }, toString: function() { return "false"; } },
	"=": { arity: 2, run: function(a, b) {
		if (typeof b == "string") b = b.substr(0, safeLimit);
		return evaluationMemory[a] = b;
	}, toString: function() { return "assign"; } },
	"get": { arity: 1, run: function(a) { return evaluationMemory[a]; }, toString: function() { return "get"; } },
	",": { arity: 2, run: function(a, b) { return b; }, toString: function() { return "comma"; } },
	"pow": { arity: 2, run: function(a, b) { return Math.pow(a, b); }, toString: function() { return "power"; } },
	"sin": { arity: 1, run: function(a) { return Math.sin(a); }, toString: function() { return "sin"; } },
	"cos": { arity: 1, run: function(a) { return Math.cos(a); }, toString: function() { return "cos"; } },
	"tan": { arity: 1, run: function(a) { return Math.tan(a); }, toString: function() { return "tan"; } },
	"asin": { arity: 1, run: function(a) { return Math.asin(a); }, toString: function() { return "asin"; } },
	"acos": { arity: 1, run: function(a) { return Math.acos(a); }, toString: function() { return "acos"; } },
	"atan": { arity: 1, run: function(a) { return Math.atan(a); }, toString: function() { return "atan"; } },
	"atan2": { arity: 2, run: function(a, b) { return Math.atan2(a, b); }, toString: function() { return "atan2"; } },
	"pi": { arity: 0, run: function() { return Math.PI; }, toString: function() { return "pi"; } },
	"e": { arity: 0, run: function() { return Math.E; }, toString: function() { return "e"; } },
	"round": { arity: 1, run: function(a) { return Math.round(a); }, toString: function() { return "round"; } },
	"floor": { arity: 1, run: function(a) { return Math.floor(a); }, toString: function() { return "floor"; } },
	"ceil": { arity: 1, run: function(a) { return Math.ceil(a); }, toString: function() { return "ceil"; } },
	"abs": { arity: 1, run: function(a) { return Math.ceil(a); }, toString: function() { return "abs"; } },
	"sqrt": { arity: 1, run: function(a) { return Math.ceil(a); }, toString: function() { return "sqrt"; } },
	"random": { arity: 0, run: function() { return Math.random(); }, toString: function() { return "random"; } },
	"space": { arity: 0, run: function() { return " "; }, toString: function() { return "space"; } },
};
// Reverse polish interpreter. Simple.
var evaluate = module.exports.evaluate = function(code) {
	var tokens = code.split(" ");
	var stack = [];
	evaluationMemory = {}; // clean memory
	for (var i=0;i<tokens.length;i++) {
		if (tokens[i] !== "") {
			if (!isNaN(tokens[i])) {
				stack.push(+tokens[i]); // convert to number
			} else if (safeFunctions[tokens[i]]) {
				var f = safeFunctions[tokens[i]];
				var stk = [];
				var args = [];
				if (stack.length < f.arity) {
					stack.push(f.toString());
					continue;
					/**return {
						message: "Oops. Evaluation failed.",
						stack: stack,
						commandsLeft: tokens.slice(i)
					};**/
				}
				for (var j=0;j<f.arity;j++) {
					stk.push(stack.pop());
				}
				while (stk.length) {
					args.push(stk.pop());
				}
				stack.push(f.run.apply(null, args));
			} else {
				stack.push(tokens[i]); // it's a string!
			}
		}
	}
	return {
		stack: stack
	};
};
