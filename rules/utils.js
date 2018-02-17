module.exports.isValidTestName = isValidTestName;
module.exports.isValidTestFunction = isValidTestFunction;

function always() {
	return 'definitely';
}

function maybe() {
	return 'maybe';
}

function or(a, b) {
	if (a === 'definitely' || b === 'definitely') {
		return 'definitely';
	}

	if (a || b) {
		return 'maybe';
	}

	return false;
}

function and(a, b) {
	if (a === 'definitely' && b === 'definitely') {
		return 'definitely';
	}

	if (a && b) {
		return 'maybe';
	}

	return false;
}

// TODO: delete things once we are confident they could never be a valid test name.
var TEST_NAME_TYPES = {
	ArrayExpression: false,
	ArrowFunctionExpression: false,
	AssignmentExpression: function (node) {
		return (node.operator === '+=' || node.operator === '=') && isValidTestName(node.right);
	},
	AwaitExpression: false, // CAUTION: It's deferred to ES7.
	BinaryExpression: function (node) {
		return node.operator === '+' && or(isValidTestName(node.left), isValidTestName(node.right));
	},
	CallExpression: maybe,
	ClassExpression: false,
	ComprehensionExpression: false,  // CAUTION: It's deferred to ES7.
	ConditionalExpression: function (node) {
		return and(isValidTestName(node.consequent), isValidTestName(node.alternate));
	},
	FunctionDeclaration: false,
	FunctionExpression: false,
	GeneratorExpression: false,  // CAUTION: It's deferred to ES7.
	Identifier: maybe,
	Literal: function (node) {
		return (typeof node.value === 'string') && 'definitely';
	},
	LogicalExpression: function (node) {
		return node.operator === '||' && and(isValidTestName(node.left), isValidTestName(node.right)); // TODO: only || if operator === '||' - otherwise right must be
	},
	MemberExpression: maybe,
	NewExpression: false,
	ObjectExpression: false,
	RestElement: false,  // TODO: Maybe?
	SequenceExpression: false,
	SpreadElement: false,  // TODO: Maybe
	Super: false,
	TaggedTemplateExpression: false,
	TemplateElement: false,
	TemplateLiteral: always,
	ThisExpression: maybe,
	UnaryExpression: false,
	UpdateExpression: false,
	YieldExpression: maybe
};

function isValidTestName(node) {
	var fn = TEST_NAME_TYPES[node.type];
	return (fn && fn(node)) || false;
}

// TODO: delete `false` items once we are confident they could never be a valid test function.
var TEST_FUNCTION_TYPES = {
	ArrayExpression: false,
	ArrowFunctionExpression: always,
	AssignmentExpression: function (node) {
		return node.operator === '=' && isValidTestFunction(node.right);
	},
	AwaitExpression: false, // tests must be declared in the same clock tick. // CAUTION: It's deferred to ES7.
	BinaryExpression: false,
	CallExpression: maybe,
	ClassExpression: false,
	ComprehensionExpression: false,  // CAUTION: It's deferred to ES7.
	ConditionalExpression: function (node) {
		return and(isValidTestFunction(node.consequent), isValidTestFunction(node.alternate));
	},
	FunctionDeclaration: false,
	FunctionExpression: always,
	GeneratorExpression: false, // function *foo() {} is parsed as a FunctionExpression with node.generator == true;  // CAUTION: It's deferred to ES7.
	Identifier: maybe,
	Literal: false,
	LogicalExpression: function (node) {
		return node.operator === '||' && and(isValidTestFunction(node.left), isValidTestFunction(node.right));
	},
	MemberExpression: maybe,
	NewExpression: false, // you could return a function from `new foo()` - but that's just weird
	ObjectExpression: false,
	RestElement: false, // TODO: Maybe?
	SequenceExpression: false, // you could do `test((a, b, c, t => {}))` - but that's just weird
	SpreadElement: false, // TODO: Maybe?
	Super: false,
	TaggedTemplateExpression: false,
	TemplateElement: false,
	TemplateLiteral: false,
	ThisExpression: maybe,
	UnaryExpression: false,
	UpdateExpression: false,
	YieldExpression: maybe
};

function isValidTestFunction(node) {
	var fn = TEST_FUNCTION_TYPES[node.type];
	return (fn && fn(node)) || false;
}
