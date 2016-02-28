'use strict';

function nameOfRootObject(node) {
	if (node.object.type === 'MemberExpression') {
		return nameOfRootObject(node.object);
	}
	return node.object.name;
}

exports.nameOfRootObject = nameOfRootObject;
