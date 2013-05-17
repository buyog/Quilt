/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryan@buyog.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

require.config({
    paths: {
        'atto': '/atto',
        'tangle': '/tangle'
    }
});
require(
[
  "atto/core",
  "tangle/core",
  "tangle/inputManager",
  "tangle/stateManager",
  "TileSet"
], function(atto, Tangle, InputManager, StateManager, TileSet) {
  "use strict";

    var _canvas   = document.querySelector('canvas'),
        _context  = null,
        _inputs   = {
            MOVEUP    : 1,
            MOVEDOWN  : 2,
            MOVELEFT  : 3,
            MOVERIGHT : 4,
            SHIFTUP    : 5,
            SHIFTDOWN  : 6,
            SHIFTLEFT  : 7,
            SHIFTRIGHT : 8
        },
        game = {
            states : new StateManager(),
            attrs  : {
              width:  _canvas && _canvas.width  || 0,
              height: _canvas && _canvas.height || 0
            },
            im     : new InputManager(),
            tiles  : new TileSet(5,5)
        };
        window.game = game; // DEBUG

    if (_canvas) {
        //_log('getting context...');
        _context = _canvas.getContext('2d');
    }


    // init state machine
    game.states.addState({
        id: 0,
        title: 'Play',
        before: function() {},
        tick: function(me) {
            //_log('game.update()');
            // no global updating to do; just tell TileSet to update itself
            me.tiles.update();
        },
        render: function(me, ctx) {
            // clear previous canvas
            //ctx.clearRect(0,0, me.attrs.width, me.attrs.height);

            me.tiles.render(ctx);
        }
    }); // end of state 0


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
    Tangle.init(_tick, _render);
    Tangle.play();


    // helper functions
    function _log(msg) {
        console.log(msg);
        //txtStatus.appendChild(document.createTextNode(msg));
        //txtStatus.appendChild(document.createElement('br'));
    }


    // DOM event handlers

    /*
    atto.addEvent(_btnOnOff, 'click', function() {
        if (Tangle.isPaused()) {
            _btnOnOff.innerHTML = "Pause";
            Tangle.play();
        } else {
            _btnOnOff.innerHTML = "Resume";
            Tangle.pause();
        }
    });
    */


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
