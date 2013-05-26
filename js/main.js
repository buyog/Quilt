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
  "TileSet"
], function(atto, pubsub, Tangle, AssetCache, InputManager, StateManager, TileSet) {
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
			SHIFTRIGHT : 8
		},
		_levels = [
			{
				width  : 2,
				height : 2,
				start  : [0,0,1,1],
				goal   : [0,1,1,0]
			}
			, {
				width  : 3,
				height : 3,
				start  : [1,0,1,0,0,0,1,0,1],
				goal   : [0,1,0,1,0,1,0,1,0]
			}
			, {
				width  : 3,
				height : 3,
				start  : [2,4,6,2,4,6,2,4,6],
				goal   : [2,2,4,2,4,6,4,6,6]
			}
			, {
				width  : 4,
				height : 4,
				start  : [0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0],
				goal   : [1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1]
			}
		],
		game = {
			states : new StateManager(),
			assets : new AssetCache(),
			attrs  : {
			  width  :  (_canvas && _canvas.width ) || 0,
			  height : (_canvas && _canvas.height) || 0
			},
			im	   : new InputManager(),
			tiles  : null,
			level  : 0
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
		id: 0,
		title: 'Loading',
		before: function(me) {
		},
		tick: function(me) {
			if (me.assets.ready()) {
				return 1;
			}
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
		id: 1,
		title: 'Play',
		before: function(me) {
			var ctx = me.context;
			// clear previous canvas
			//ctx.clearRect(0,0, me.attrs.width, me.attrs.height);
			ctx.fillStyle = _bgColor;
			ctx.fillRect(0,0, me.attrs.width, me.attrs.height);

			if (me.assets.hasAsset("logo")) {
				ctx.drawImage(me.assets.getAsset("logo"), 40, 20);
			}

			ctx.fillStyle = "white";
			ctx.font = "10pt sans-serif";
			ctx.fillText("Arrow keys to move pivot", 80, 410);
			ctx.fillText("IJKL to shift tiles", 80, 430);
		},
		tick: function(me) {
			//_log('game.update()');
			// no global updating to do; just tell TileSet to update itself
			me.tiles.update();
		},
		render: function(me, ctx) {
			me.tiles.render(ctx);
		}
	}); // end of state 1

	game.states.addState({
		id: 2,
		title: 'Level cleared',
		before: function(me) {
			var ctx = me.context;

			// render winning tile pattern
			me.tiles.render(ctx);

			// render "CLEARED" banner
			ctx.fillStyle = "rgba(0,160,209,0.5)";
			ctx.fillRect(20,200, me.attrs.width - 40, 60);
			ctx.fillStyle = "white";
			ctx.font = "24pt sans-serif";
			ctx.fillText("LEVEL CLEARED!", 25, 210);

			// init state-transition countdown
			me.tickCount = 0;
		},
		tick: function(me) {
			if (me.tickCount++ > 100) {
				return 1;	// go back to state 1 (we've already advanced to the next tile set)
			}
		},
		render: function(me, ctx) {
			// no additional rendering (did it in before())
		}
	}); // end of state 2 (LEVEL CLEAR)

	game.states.addState({
		id: 3,
		title: 'Win',
		before: function(me) {
			var ctx = me.context;

			// render winning tile pattern
			me.tiles.render(ctx);

			// render "CLEARED" banner
			ctx.fillStyle = "rgba(0,160,209,0.5)";
			ctx.fillRect(20,200, me.attrs.width - 40, 70);
			ctx.fillStyle = "white";
			ctx.font = "36pt sans-serif";
			ctx.fillText("YOU WIN!", 50, 210);
		},
		tick: function(me) {
		},
		render: function(me, ctx) {
			// no additional rendering (did it in before())
		}
	}); // end of state 3 (WIN)


	// StateManager event callbacks
	function stateChange(data) {
		_log( atto.supplant("Entered state {id}: {title}", data) );
	}
	stateChange(game.states.currentState());
	game.states.events.changeState.watch(stateChange);


	// Pub/Sub handlers (for lightweight cross-object messaging)
	function _levelComplete() {
		if (game.level === _levels.length-1) {
			// W00t! You win!
			game.states.changeState(3, game);
		} else {
			// show "CLEARED", then next level
			game.states.changeState(2, game);
			_loadLevel(game.level+1);
		}
	}
	pubsub.subscribe("quilt.tileset.solved", _levelComplete);

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
		switch(input) {
			case _inputs.MOVEUP:
				game.tiles.input(game.tiles.commands.MOVEUP);
				break;
			case _inputs.MOVEDOWN:
				game.tiles.input(game.tiles.commands.MOVEDOWN);
				break;
			case _inputs.MOVELEFT:
				game.tiles.input(game.tiles.commands.MOVELEFT);
				break;
			case _inputs.MOVERIGHT:
				game.tiles.input(game.tiles.commands.MOVERIGHT);
				break;
			case _inputs.SHIFTUP:
				game.tiles.input(game.tiles.commands.SHIFTUP);
				break;
			case _inputs.SHIFTDOWN:
				game.tiles.input(game.tiles.commands.SHIFTDOWN);
				break;
			case _inputs.SHIFTLEFT:
				game.tiles.input(game.tiles.commands.SHIFTLEFT);
				break;
			case _inputs.SHIFTRIGHT:
				game.tiles.input(game.tiles.commands.SHIFTRIGHT);
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
