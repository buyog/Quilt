/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryan@buyog.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

/*jslint browser: true*/
/*jslint plusplus: true*/
/*jslint bitwise: true*/
/*global define*/

define(
    ["atto/pubsub"],
    function(pubsub) {
    "use strict";
        var _tileStyles = [
            'white',
            'red',
            'orange',
            'yellow',
            'green',
            'blue',
            'purple'
        ];

        function constructor(_index, color) {
            var _color = (color !== undefined) ? color : Math.floor(Math.random()*6),
                _currentState = 0,
                _i = _index,
                _newIndex = -1,
                _animTime = 0,
                _yOffset = 0,
                _dirty = true,
                _states = {
                    'normal':0,
                    'active':1
                };

            function _tick(game) {
                switch (_currentState) {
                    case _states.normal:
                        break;
                    case _states.active:
                        break;
                    default:
                        break;
                }
            }

            function _render(ctx, x, y) {
                var sx;

                if (_dirty) {
                    sx = (_color * 36) + 1;

                    switch (_currentState) {
                        case _states.normal:
                            //ctx.drawImage(tiles, sx, 1, 34, 34, x, y, 30, 30);
                            ctx.fillStyle = (_color > -1) ? _tileStyles[_color] : "black";
                            ctx.fillRect(x,y, 30, 30);
                            break;

                        case _states.active:
                            ctx.fillStyle = (_color > -1) ? _tileStyles[_color] : "black";
                            ctx.fillRect(x,y, 30, 30);

                            // draw "selected" marker
                            ctx.fillStyle = "rgba(255,255,255, 0.35)";
                            ctx.beginPath();
                            ctx.arc(x + 15, y + 15, 10, 0, Math.PI*2, true);
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();

                            break;

                        default:
                            break;
                    }
                    _dirty = false;
                }
            }

            function _select() {
                _currentState = _states.active;
                _dirty = true;
            }

            function _deselect() {
                _currentState = _states.normal;
                _dirty = true;
            }

            function _setDirty(val) {
                _dirty = val;
            }

            function _setIndex(index) {
                _i = index;
            }

            function _setColor(c) {
                if (c >= 0 && c < _tileStyles.length) {
                    _color = c;
                }
            }

            function _str() {
                return _tileStyles[_color];
            }

            return {
                color    : _color,
                setColor : _setColor,
                render   : _render,
                setIndex : _setIndex,
                tick     : _tick,
                getState : function() { return _currentState; },
                select   : _select,
                deselect : _deselect,
                setDirty : _setDirty
            };

        } // end of constructor

        return constructor;
    } // end AMD callback function
);
