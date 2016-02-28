'use strict';

exports.nameOfRootObject = function (node) {
	if (node.object.type === 'MemberExpression') {
		return exports.nameOfRootObject(node.object);
	}

	return node.object.name;
};
