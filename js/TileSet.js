/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryan@buyog.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

/*jslint browser: true*/
/*jslint plusplus: true*/
/*jslint bitwise: true*/
/*global define, console*/

define(
    ["atto/core", "atto/pubsub", "Tile"],
    function(atto, pubsub, Tile) {
        "use strict";

        var _commands = {
            'MOVEUP'   : 's0',
            'MOVELEFT' : 's1',
            'MOVEDOWN' : 's2',
            'MOVERIGHT': 's3',
            'SHIFTUP'   : 's4',
            'SHIFTLEFT' : 's5',
            'SHIFTDOWN' : 's6',
            'SHIFTRIGHT': 's7'
        };


        function _printTileArray(tiles) {
            var i, out=[];
            for (i=0; i<tiles.length; i++) {
                out.push(tiles[i].color);
            }

            return out.join(',');
        }

        function _initGrid(w,h, tileMap) {
            var x, color, len=w*h,
                grid = [],
                tiles = tileMap || {};

            for (x=0; x<len; x++) {
                color = tiles[x];
                grid.push( new Tile(x, color) );
            }
            return grid;
        }

        function constructor(options, isPreview) {

            // private defs & methods
            var args = options || {},
                _w  = args.width || 5,
                _h  = args.height || 5,
                _x0 = args.x0 || isPreview ? 240 : 20,
                _y0 = args.y0 || isPreview ? 400 : 100,
                _x1 = args.x1 || 300,
                _y1 = args.y1 || isPreview ? 460 : 380,
                _cw = ~~((_x1-_x0) / _w),
                _ch = ~~((_y1-_y0) / _h),
                _ar         = _initGrid(_w, _h, isPreview ? args.goal : args.start),
                _goal       = isPreview ? null : args.goal,
                _selected   = null;

            function _get_click_target(coords) {
                var _ix, _iy;
                //console.log('coords:', coords.x, ',', coords.y);
                if (coords && coords.x && coords.y) {
                    if (coords.x >= _x0 && coords.x <= _x1 &&
                        coords.y >= _y0 && coords.y <= _y1) {

                        _ix = Math.floor((coords.x - _x0) / 36);
                        _iy = Math.floor((coords.y - _y0) / 36);
                        return {
                            x: _ix,
                            y: _iy,
                            idx: (_ix * _h) + _iy
                        };
                    }
                }

                return null;
            }

            function _selectTile(idx) {
                if (idx >= 0 && idx < _ar.length) {
                    if (_selected !== null) {
                        _ar[_selected].deselect();
                    }
                    _selected = idx;
                    _ar[idx].select();
                }
            }

            function _shiftCol(col, offset) {
                var i, l, r, x = col * _h,
                    buffer = _ar.slice(x, x+_h);
                if (offset === 0) {
                    return;
                } else if (offset < 0) {
                    offset += _h;
                }

                //console.log('about to shift column', col, ', offset:', offset, ', buffer:', printTileArray(buffer));
                l = buffer.slice(_h-offset);
                r = buffer.slice(0, _h-offset);
                buffer = l.concat(r);
                //console.log('shifted:', printTileArray(buffer));

                for (i=0; i<_h; i++) {
                    // keep tile highlighter in the same place
                    if (i+x === _selected) {
                        _ar[i+x].deselect();
                        buffer[i].select();
                    }

                    _ar[i+x] = buffer[i];
                    _ar[i+x].setIndex( i+x );
                    _ar[i+x].setDirty( true );
                }
                //delete(buffer);
            }

            function _shiftRow(row, offset) {
                var col, l, r, index, buffer = [];
                if (offset === 0) {
                    return;
                }
                for (col=0; col<_w; col++) {
                    index = (col * _h) + row;
                    buffer.push(_ar[index]);
                }
                //console.log('about to shift row', row, ', offset:', offset, ', buffer:', _printTileArray(buffer));
                offset = offset * -1;   // slice offset is backwards for our purposes
                l = buffer.slice(offset);
                r = buffer.slice(0, offset);
                buffer = l.concat(r);
                //console.log('shifted:', _printTileArray(buffer));

                for (col=0; col<_w; col++) {
                    index = (col * _h) + row;

                    // keep tile highlighter in the same place
                    if (index === _selected) {
                        _ar[_selected].deselect();
                        buffer[col].select();
                    }

                    _ar[index] = buffer[col];
                    _ar[index].setIndex( index );
                    _ar[index].setDirty( true );
                }
                //delete(buffer);
            }

            function _shift(x1,y1,x2,y2) {
                var i, tmp;
                //   0  1  2  3  4  5  6  7
                //           y1       y2     == offset +3 (y2-y1)
                //   5  6  7  0  1  2  3  4  == ar.slice(8-3) + ar.slice(0,8-3)

                // OR

                //   0  1  2  3  4  5  6  7
                //     y2          y1        == offset -4 (y2-y1; +4 also works in this case, but that's an artifact of array size)
                //   4  5  6  7  0  1  2  3

                // OR

                //   0  1  2  3  4  5  6  7
                //     y1 y2                 == offset +1 (y2-y1)
                //   7  0  1  2  3  4  5  6

                // OR

                //   0  1  2  3  4  5  6  7
                //        y2    y1          == offset -2 (y2-y1; also +6: we can add 8 to any negative offset)
                //   2  3  4  5  6  7  0  1

                if (x1===x2) {
                    // vertical slide:  I can just slice & concat the separate parts of _ar[col]:
                    _shiftCol(x1, y2-y1);

                } else if (y1===y2) {

                    // horizontal slide:  harder, because we're shifting elements across column arrays
                    _shiftRow(y1, x2-x1);

                } else {
                    // invalid slide operation!
                }
            }

            function _index_to_xy(idx) {
                var x = ~~(idx / _h),
                    y = idx % _h;
                return {
                    x:  _x0 + (x * _cw),
                    y:  _y0 + (y * _ch)
                };
            }

            function _checkTiles() {
                var i;
                if (_ar.length !== _goal.length) {
                    return false;
                }
                for (i=0; i<_ar.length; i++) {
                    if (_ar[i].color !== _goal[i]) {
                        return false;
                    }
                }
                return true;
            }

            function _update() {
                // check to see if we've met the goal
                if (_goal && _checkTiles()) {
                    pubsub.publish("quilt.tileset.solved");
                }
            }

            function _render(ctx) {
                var i, coords = null;

                ctx.strokeStyle = "white";
                ctx.strokeRect(_x0, _y0, _x1-_x0, _y1-_y0);

                for (i=0; i<_w*_h; i++) {
                    coords = _index_to_xy(i);
                    _ar[i].render(ctx, coords.x, coords.y, _cw, _ch);
                }
            }

            function _setDirty(val) {
                var i;
                for (i=0; i<_w*_h; i++) {
                    _ar[i].setDirty(val);
                }
            }

            function _cmd(cmd) {
                var col, row;

                switch (cmd) {
                    case _commands.MOVEUP:
                        if ((_selected > 0) && (_selected % _h !== 0)) {
                            _selectTile(_selected-1);
                        }
                        break;

                    case _commands.MOVEDOWN:
                        if ((_selected < _ar.length-1) && (_selected % _h !== _h-1)) {
                            _selectTile(_selected+1);
                        }
                        break;

                    case _commands.MOVELEFT:
                        if (_selected >= _h) {
                            _selectTile(_selected-_h);
                        }
                        break;

                    case _commands.MOVERIGHT:
                        if (_selected < _ar.length-_h+1) {
                            _selectTile(_selected+_h);
                        }
                        break;

                    case _commands.SHIFTUP:
                        col = ~~(_selected / _h);
                        _shiftCol(col,-1);
                        break;

                    case _commands.SHIFTDOWN:
                        col = ~~(_selected / _h);
                        _shiftCol(col,1);
                        break;

                    case _commands.SHIFTLEFT:
                        row = _selected % _h;
                        _shiftRow(row,-1);
                        break;

                    case _commands.SHIFTRIGHT:
                        row = _selected % _h;
                        _shiftRow(row,1);
                        break;

                    default:
                        // unrecognized input
                        console.log('unrecognized input:', cmd);
                        break;
                }
            }


            // set up initial state
            if (!isPreview) {
                _selectTile(0);
            }


            return {
                update   : _update,
                render   : _render,
                setDirty : _setDirty,
                input    : _cmd,
                commands : _commands
            }; // end of public interface
        } // end of constructor

        return constructor;
    } // end AMD callback function
);
