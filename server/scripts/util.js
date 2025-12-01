const uniqueWorkspaceCode = codeLength => {
	let code = '';
	const validCharacters = [
		'a',
		'A',
		'b',
		'B',
		'0',
		'c',
		'C',
		'd',
		'D',
		'e',
		'E',
		'f',
		'1',
		'F',
		'g',
		'G',
		'h',
		'H',
		'2',
		'i',
		'I',
		'j',
		'J',
		'k',
		'K',
		'3',
		'l',
		'L',
		'm',
		'M',
		'4',
		'n',
		'N',
		'o',
		'O',
		'5',
		'p',
		'P',
		'q',
		'Q',
		'6',
		'r',
		'R',
		's',
		'S',
		'7',
		't',
		'T',
		'8',
		'u',
		'U',
		'v',
		'V',
		'w',
		'W',
		'9',
		'x',
		'X',
		'y',
		'Y',
		'z',
		'Z',
	];

	for (let i = 0; i < codeLength; i++) {
		const r = Math.floor(Math.random() * validCharacters.length);
		code += validCharacters[r];
	}

	console.log('code:', code);
	return code;
};

for (let i = 0; i < 50; i++) {
	uniqueWorkspaceCode(25);
}

export default { uniqueWorkspaceCode };
