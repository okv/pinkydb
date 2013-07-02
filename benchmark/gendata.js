'use strict';

var fs = require('fs');

var count = process.env.NODE_TD_COUNT || 10000,
	testDataPath = '/tmp/pinkydb-benchmark-data';

function generate(n) {
	var docs = [];
	for (var i = 0; i < n; i++) {
		var fullName = getRandomFullName();
		var doc = {
			name: {
				first: fullName.split(' ')[0],
				last: fullName.split(' ')[1],
				full: fullName
			},
			contacts: {
				emails: [fullName.toLowerCase().replace(' ', '.') + '@mail.com'],
				phones: [getRandomNumber(), getRandomNumber()]
			},
			birthday: getRandomInt(
				new Date('October 01, 1970 00:00:00').getTime(),
				new Date().getTime()
			),
			cityOfBirt: getRandomCity(),
			occupation: getRandomOccupation(),
			resume: 'Lorem ipsum dolor sit amet, consectetur adipisicing ' +
			'elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		};
		docs.push(doc);
	}
	return docs;
}

/**
 * Helpers use above
 */

var fullNames = [
	'Elina Panek',
	'Dillon Simons',
	'Saundra Severin',
	'Harmony Brazell',
	'Ellie Polasek',
	'Erlinda Shannon',
	'Nancie Kowalski',
	'Carol Royse',
	'Pearly Mazon',
	'Mabel Gipe',
	'Eugena Wilks',
	'Cyrus Shah',
	'Delena Scheuerman',
	'Shenita Henery',
	'Aisha Monzo',
	'Nikita Sigmund',
	'Lavette Longwell',
	'Alisia Strouth',
	'Tanisha Maclin',
	'Margorie Hodes',
];

var getRandomFullName = randomArrayItem(fullNames);

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomNumber() {
	var number = '+79';
	for (var i = 0; i < 9; i++) {
		number += getRandomInt(0, 9);
	}
	return number;
}

function randomArrayItem(array) {
	return function() {
		return array[getRandomInt(0, array.length - 1)];
	}
}

var cities = [
	'Biloxi',
	'De Kalb',
	'Willow Park',
	'Clintwood',
	'Radar Base',
	'Gang Mills',
	'Palo Cedro',
	'Ryderwood',
	'New Baden',
	'Clewiston',
	'Pollock',
	'Citrus Hills',
	'Salemburg',
	'Glasgow',
	'Los Minerales',
	'Las Maravillas',
	'Wilmar',
	'Brookridge',
	'Summerhill',
	'Guy'
];

var getRandomCity = randomArrayItem(cities);

var occupations = [
	'Gaming Manager',
	'Deli Clerk',
	'Computer Assembler',
	'Correction Officer',
	'Information Management Officer',
	'Agricultural Economics Professor',
	'Safety Coordinator',
	'Advertising Manager',
	'Gccs Cop/M Operator',
	'Paper Conservator',
	'Map Maker',
	'Certified Nurse Midwife (CNM)',
	'Product Safety Test Engineer',
	'Control System Computer Scientist',
	'Drug Abuse Counselor',
	'Personnel Coordinator',
	'Family Preservation Worker',
	'Clay Mine Cutting Machine Operator',
	'School Psychometrist',
	'Student Advisor'
];

var getRandomOccupation = randomArrayItem(occupations);


var docs = generate(count);
console.log('*** Save ' + count + ' objects to file ' + testDataPath);
fs.writeFileSync(testDataPath, JSON.stringify(docs, null, 4));
