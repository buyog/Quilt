/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryan@buyog.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

/*jslint browser: true*/
/*global define*/

define([], function() {
	"use strict";

	return [
		{
			width  : 2, height : 2,
			start  : [0,0,1,1],
			goal   : [0,1,1,0]
		}
		, {
			width  : 3, height : 2,
			start  : [0,1,1,0,1,0],
			goal   : [1,0,0,1,0,1]
		}
		, {
			width  : 3, height : 3,
			start  : [1,0,1,0,0,0,1,0,1],
			goal   : [0,1,0,1,0,1,0,1,0]
		}
		, {
			width  : 3, height : 3,
			start  : [2,4,6,2,4,6,2,4,6],
			goal   : [2,2,4,2,4,6,4,6,6]
		}
		, {
			width  : 4, height : 4,
			start  : [0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0],
			goal   : [1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1]
		}
		, {
			width  : 4, height : 4,
			start  : [6,6,6,1,6,6,6,6,6,6,6,6,1,6,6,1],
			goal   : [6,6,6,6,6,1,1,6,6,1,6,6,6,6,6,6]
		}
		, {
			width  : 5, height : 5,
			start  : [0,1,2,1,0,1,0,2,0,1,2,2,0,2,2,1,0,2,0,1,0,1,2,1,0],
			goal   : [0,0,2,1,1,0,2,0,1,1,2,0,2,2,2,0,2,0,1,1,0,0,2,1,1]
		}
		, {
			width  : 6, height : 4,
			start  : [2,3,4,5,6,7,2,3,4,5,6,7,2,3,4,5,6,7,2,3,4,5,6,7],
			goal   : [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7]
		}
		, {
			width  : 7, height : 7,
			start  : [
				1,0,0,0,1,1,1,
				0,2,2,2,0,1,1,
				0,2,2,2,2,0,1,
				1,0,2,1,2,1,0,
				0,1,1,1,1,0,1,
				0,1,1,1,0,1,1,
				1,0,0,0,1,1,1
			],
			goal   : [
				1,2,2,0,0,0,1,
				2,1,1,1,1,1,0,
				2,1,0,1,0,1,0,
				2,1,1,1,0,1,0,
				2,1,0,1,0,1,0,
				2,1,1,1,1,1,0,
				1,2,2,0,0,0,1
			]
		}
	];
});
