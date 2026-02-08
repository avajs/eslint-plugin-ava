import util from '../util.js';

const MESSAGE_ID = 'no-ava-in-dependencies';

function findMember(objectNode, key) {
	return objectNode.members.find(member => member.name.value === key);
}

function detectIndent(source, members) {
	if (members.length === 0) {
		return '\t';
	}

	const firstMember = members[0];
	const lineStart = source.lastIndexOf('\n', firstMember.loc.start.offset) + 1;
	return source.slice(lineStart, firstMember.loc.start.offset);
}

function removeMember(fixer, source, objectNode, memberIndex) {
	const {members} = objectNode;
	const member = members[memberIndex];

	if (members.length === 1) {
		// Only member - empty the object but keep braces
		return fixer.replaceTextRange(
			[objectNode.loc.start.offset, objectNode.loc.end.offset],
			'{}',
		);
	}

	if (memberIndex === members.length - 1) {
		// Last member - remove from end of previous member to end of this member
		const previousMember = members[memberIndex - 1];
		return fixer.removeRange([previousMember.loc.end.offset, member.loc.end.offset]);
	}

	// First or middle member - remove from start of line to start of next member's line
	const nextMember = members[memberIndex + 1];
	const removeStart = source.lastIndexOf('\n', member.loc.start.offset - 1);
	const removeEnd = source.lastIndexOf('\n', nextMember.loc.start.offset);
	return fixer.removeRange([
		removeStart === -1 ? member.loc.start.offset : removeStart,
		removeEnd === -1 ? nextMember.loc.start.offset : removeEnd,
	]);
}

const create = context => ({
	Document(node) {
		const root = node.body;
		if (!root || root.type !== 'Object') {
			return;
		}

		const depsMember = findMember(root, 'dependencies');
		if (!depsMember || depsMember.value.type !== 'Object') {
			return;
		}

		const avaMember = findMember(depsMember.value, 'ava');
		if (!avaMember) {
			return;
		}

		const devDepsMember = findMember(root, 'devDependencies');
		const alreadyInDevDeps = devDepsMember
			&& devDepsMember.value.type === 'Object'
			&& findMember(devDepsMember.value, 'ava');

		context.report({
			loc: avaMember.name.loc,
			messageId: MESSAGE_ID,
			fix(fixer) {
				const source = context.sourceCode.getText();
				const fixes = [];
				const isOnlyDependency = depsMember.value.members.length === 1;

				if (isOnlyDependency && !alreadyInDevDeps && !devDepsMember) {
					// Replace "dependencies" key with "devDependencies" - simplest case
					fixes.push(fixer.replaceTextRange(
						[depsMember.name.loc.start.offset, depsMember.name.loc.end.offset],
						'"devDependencies"',
					));
					return fixes;
				}

				if (isOnlyDependency) {
					// Remove entire dependencies member from root
					const depsIndex = root.members.indexOf(depsMember);
					fixes.push(removeMember(fixer, source, root, depsIndex));
				} else {
					// Remove just the ava entry from dependencies
					const avaIndex = depsMember.value.members.indexOf(avaMember);
					fixes.push(removeMember(fixer, source, depsMember.value, avaIndex));
				}

				if (!alreadyInDevDeps) {
					const avaEntry = `"ava": ${source.slice(avaMember.value.loc.start.offset, avaMember.value.loc.end.offset)}`;

					if (devDepsMember && devDepsMember.value.type === 'Object') {
						// Add to existing devDependencies
						const devMembers = devDepsMember.value.members;
						const innerIndent = devMembers.length > 0
							? detectIndent(source, devMembers)
							: detectIndent(source, depsMember.value.members);

						if (devMembers.length === 0) {
							// Empty devDependencies - insert between braces
							const closingIndent = detectIndent(source, root.members);
							fixes.push(fixer.replaceTextRange(
								[devDepsMember.value.loc.start.offset, devDepsMember.value.loc.end.offset],
								`{\n${innerIndent}${avaEntry}\n${closingIndent}}`,
							));
						} else {
							// Append after last member
							const lastMember = devMembers.at(-1);
							fixes.push(fixer.insertTextAfterRange(
								[lastMember.loc.end.offset - 1, lastMember.loc.end.offset],
								`,\n${innerIndent}${avaEntry}`,
							));
						}
					} else if (devDepsMember) {
						// Existing devDependencies is invalid (non-object), replace its value.
						const indent = detectIndent(source, root.members);
						const innerIndent = detectIndent(source, depsMember.value.members);
						fixes.push(fixer.replaceTextRange(
							[devDepsMember.value.loc.start.offset, devDepsMember.value.loc.end.offset],
							`{\n${innerIndent}${avaEntry}\n${indent}}`,
						));
					} else {
						// Create devDependencies section after dependencies
						const indent = detectIndent(source, root.members);
						const innerIndent = detectIndent(source, depsMember.value.members);
						const devDepsBlock = `"devDependencies": {\n${innerIndent}${avaEntry}\n${indent}}`;

						fixes.push(fixer.insertTextAfterRange(
							[depsMember.loc.end.offset - 1, depsMember.loc.end.offset],
							`,\n${indent}${devDepsBlock}`,
						));
					}
				}

				return fixes;
			},
		});
	},
});

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow AVA in `dependencies`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: '`ava` should be in `devDependencies` instead of `dependencies`.',
		},
	},
};
