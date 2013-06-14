/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryan@buyog.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

/*jslint browser: true*/
/*jslint bitwise: true*/
/*jslint plusplus: true*/
/*global require, console*/

require.config({
	paths: {
		'atto': '/atto',
		'tangle': '/tangle'
	}
});
require(
[
  "atto/core",
  "atto/pubsub",
  "tangle/core",
  "tangle/assetCache",
  "tangle/inputManager",
  "tangle/stateManager",
  "TileSet",
  "levelData"
], function(
	atto, pubsub, Tangle, AssetCache, InputManager, StateManager,
	TileSet, _levels) {
  "use strict";

	var _canvas   = document.querySelector('canvas'),
		_context  = null,
		_bgColor  = "#222844",
		_inputs   = {
			MOVEUP	: 1,
			MOVEDOWN  : 2,
			MOVELEFT  : 3,
			MOVERIGHT : 4,
			SHIFTUP	: 5,
			SHIFTDOWN  : 6,
			SHIFTLEFT  : 7,
			SHIFTRIGHT : 8,
			HELP       : 9
		},
		game = {
			states : new StateManager(),
			assets : new AssetCache(),
			attrs  : {
			  width  :  (_canvas && _canvas.width ) || 0,
			  height : (_canvas && _canvas.height) || 0
			},
			im	    : new InputManager(),
			tiles   : null,
			preview : null,
			level   : 0
		},
        _btnOnOff = document.getElementById('onoff'),
        _txtFPS   = document.getElementById('fps');
		window.game = game; // DEBUG


	// helper functions
	function _updateFPS(fps) {
        _txtFPS.innerHTML = ~~(fps);
    }

	function _log(msg) {
		var d = new Date().toISOString().slice(-13, -1);
		console.log(atto.supplant("[{time}] {msg}", {"time":d, "msg": msg}));
	}

	function _loadLevel(idx) {
		if (idx < _levels.length) {
			console.log("Loading level", idx, "...");
			game.tiles = new TileSet(_levels[idx]);
			game.preview = new TileSet(_levels[idx], true);
			game.level = idx;
			return true;
		} else {
			return false;
		}
	}
	window.loadLevel = _loadLevel;


	if (_canvas) {
		//_log('getting context...');
		_context = _canvas.getContext('2d');
		game.context = _context;
	}
	
	// init assets
	game.assets.addAsset("logo", "assets/logo.png");


	// init state machine
	game.states.addState({
		id: 0, title: 'Loading',
		before: function(me) {},
		tick: function(me) {
			if (me.assets.ready()) { return 1; }
		},
		render: function(me, ctx) {
			ctx.fillStyle = _bgColor;
			ctx.fillRect(0,0, me.attrs.width, me.attrs.height);
			ctx.fillStyle = "white";
			ctx.textBaseline = "top";
			ctx.fillText("Loading...", 50, 330);
		}
	}); // end of state 0
	
	game.states.addState({
		id: 1, title: 'Play',
		before: function(me) {
			var ctx = me.context;

			// clear previous canvas
			ctx.fillStyle = _bgColor;
			ctx.fillRect(0,0, me.attrs.width, me.attrs.height);

			if (me.assets.hasAsset("logo")) {
				ctx.drawImage(me.assets.getAsset("logo"), 40, 20);
			}

			ctx.fillStyle = "white";
			ctx.font = "18pt sans-serif";
			ctx.fillText("GOAL:", 160, 416);

			// set the entire tilemap's dirty flag so it redraws
			me.tiles.setDirty(true);
			me.preview.setDirty(true);
		},
		tick: function(me) {},
		render: function(me, ctx) {
			me.tiles.render(ctx);
			me.preview.render(ctx);
		}
	}); // end of state 1


	// StateManager event callbacks
	function stateChange(data) {
		_log( atto.supplant("Entered state {id}: {title}", data) );
	}
	stateChange(game.states.currentState());
	game.states.events.changeState.watch(stateChange);


	// set up main loops
	function _tick() {
		game.states.tick(game);
	}
	function _render() {
		game.states.render(game, _context);
	}
	Tangle.init(_tick, _render, _updateFPS);

	// start first tutorial level
	_loadLevel(0);
	Tangle.play();


	// DOM event handlers

	atto.addEvent(_btnOnOff, 'click', function() {
		if (Tangle.isPaused()) {
			_btnOnOff.innerHTML = "Pause";
			Tangle.play();
		} else {
			_btnOnOff.innerHTML = "Resume";
			Tangle.pause();
		}
	});


	// set up input manager (could be done in another file and just included here)

	game.im.listen(function(input) {
		var currentStateId;

		currentStateId = game.states.currentState().id;
		switch(input) {
			case _inputs.MOVEUP:
				if (currentStateId === 1) {
					game.tiles.input(game.tiles.commands.MOVEUP);
				}
				break;
			case _inputs.MOVEDOWN:
				if (currentStateId === 1) {
					game.tiles.input(game.tiles.commands.MOVEDOWN);
				}
				break;
			case _inputs.MOVELEFT:
				if (currentStateId === 1) {
					game.tiles.input(game.tiles.commands.MOVELEFT);
				}
				break;
			case _inputs.MOVERIGHT:
				if (currentStateId === 1) {
					game.tiles.input(game.tiles.commands.MOVERIGHT);
				}
				break;
			case _inputs.SHIFTUP:
				if (currentStateId === 1) {
					game.tiles.input(game.tiles.commands.SHIFTUP);
				}
				break;
			case _inputs.SHIFTDOWN:
				if (currentStateId === 1) {
					game.tiles.input(game.tiles.commands.SHIFTDOWN);
				}
				break;
			case _inputs.SHIFTLEFT:
				if (currentStateId === 1) {
					game.tiles.input(game.tiles.commands.SHIFTLEFT);
				}
				break;
			case _inputs.SHIFTRIGHT:
				if (currentStateId === 1) {
					game.tiles.input(game.tiles.commands.SHIFTRIGHT);
				}
				break;
			default:
				break;
		}
	});

	game.im.alias(document, 'key:I', _inputs.SHIFTUP);
	game.im.alias(document, 'key:J', _inputs.SHIFTLEFT);
	game.im.alias(document, 'key:K', _inputs.SHIFTDOWN);
	game.im.alias(document, 'key:L', _inputs.SHIFTRIGHT);

	game.im.alias(document, 'key:ARROW_U', _inputs.MOVEUP);
	game.im.alias(document, 'key:ARROW_L', _inputs.MOVELEFT);
	game.im.alias(document, 'key:ARROW_D', _inputs.MOVEDOWN);
	game.im.alias(document, 'key:ARROW_R', _inputs.MOVERIGHT);

	game.im.alias(document, 'key:KEYPAD_8', _inputs.MOVEUP);
	game.im.alias(document, 'key:KEYPAD_4', _inputs.MOVELEFT);
	game.im.alias(document, 'key:KEYPAD_2', _inputs.MOVEDOWN);
	game.im.alias(document, 'key:KEYPAD_6', _inputs.MOVERIGHT);
});
