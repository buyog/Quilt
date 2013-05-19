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

        function _initGrid(w,h, tileMap) {
            var x, color, len=w*h,
                grid = [],
                tiles = tileMap || {};

            for (x=0; x<len; x++) {
                color = tiles[x];
                if (color) {
                    grid.push( new Tile(x, color) );
                } else {
                    grid.push( new Tile(x) );
                }
            }
            return grid;
        }

        function constructor(options) {

            // private defs & methods
            var args = options || {},
                _w  = args.width || 5,
                _h  = args.height || 5,
                _ar = _initGrid(_w, _h, args.tileMap),
                _x0 = args.x0 || 20,
                _y0 = args.y0 || 100,
                _x1 = args.x1 || 300,
                _y1 = args.y1 || 380,
                _cellWidth  = 32, //~~((_x1-_x0) / _w),
                _cellHeight = 32, //~~((_y1-_y0) / _h),
                _selected   = null;

            console.log('calculated cell width:', _cellWidth);
            console.log('calculated cell height:', _cellHeight);

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
                } else if (offset < 0) {
                    offset += _h;
                }
                for (col=0; col<_w; col++) {
                    index = (col * _h) + row;
                    buffer.push(_ar[index]);
                }
                //console.log('about to shift row', row, ', offset:', offset, ', buffer:', printTileArray(buffer));
                l = buffer.slice(_h-offset);
                r = buffer.slice(0, _h-offset);
                buffer = l.concat(r);
                //console.log('shifted:', printTileArray(buffer));

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
                var _x = ~~(idx / _h) + 0.5,
                    _y = idx % _h,
                    _cellw = _x * _cellWidth,   // was _x*32
                    _cellh = _y * _cellHeight;  // was _y*32
                return {
                    x:  _x,
                    y:  _y,
                    dx: _x0 + _cellw,
                    dy: _y0 + _cellh
                };
            }


            function _update() {
                //TODO
            }

            function _render(ctx) {
                var i, coords = null;

                ctx.strokeRect(_x0, _y0, _x1-_x0, _y1-_y0);

                for (i=0; i<_w*_h; i++) {
                    coords = _index_to_xy(i);

                    if (_ar[i]) {
                        _ar[i].render(ctx, coords.dx, coords.dy);
                    }

                    // FUTURE OPTIMIZATION: only repaint if this tile is "dirty"
                    /*
                    if (_ar[i].dirty) {
                        _ar[i] && _ar[i].render(ctx, coords.dx, coords.dy);
                        _ar[i].dirty = false;
                    }*/
                }
             }

            function _cmd(cmd) {
                var col, row;

                switch (cmd) {
                    case _commands.MOVEUP:
                        if (_selected > 0 && _selected % _h !== 0) {
                            _selectTile(_selected-1);
                        }
                        break;

                    case _commands.MOVEDOWN:
                        if (_selected < _ar.length-1) {
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
                        col = ~~(_selected / _w);
                        _shiftCol(col,-1);
                        break;

                    case _commands.SHIFTDOWN:
                        col = ~~(_selected / _w);
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
            _selectTile(0);


            return {
                update   : _update,
                render   : _render,
                input    : _cmd,
                commands : _commands
            }; // end of public interface
        } // end of constructor

        return constructor;
    } // end AMD callback function
);
