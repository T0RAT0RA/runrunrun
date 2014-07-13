define(["lib/pixi"], function (PIXI) {

    var GameRenderer = Class.extend({
        init: function(game) {
            var self = this;

            this.game       = game;
            this.stage      = new PIXI.Stage(0xFFFFFF, true);
            this.renderer   = null;
        },

        initMap: function (config) {
            console.log("GameRenderer - initMap");

            var self = this;

            this.map        = config.map;
            this.renderer   = PIXI.autoDetectRenderer(this.map.size.width, this.map.size.height);

            var tileType, x, y, isoX, isoY, idx
                xOffset = (this.map.tilesOffset)? this.map.tilesOffset.x : 0,
                yOffset = (this.map.tilesOffset)? this.map.tilesOffset.y : 0;

            //Draw background images
            if (this.map.background) {
                this.drawImages(this.map.background);
            }

            //Draw tiles
            for (var i = 0, iL = this.map.tiles.length; i < iL; i++) {
                for (var j = 0, jL = this.map.tiles[i].length; j < jL; j++) {
                    // cartesian 2D coordinate
                    x = j * this.map.tileWidth;
                    y = i * this.map.tileHeight;

                    // iso coordinate
                    isoX = x - y;
                    isoY = (x + y) / 2;

                    tileType = this.map.tiles[i][j];
                    if (tileType == 1) {
                        drawTile = this.isoTile(0xAAAAAA, 0x666666, this.map.tileWidth, this.map.tileHeight);
                        tile = drawTile(xOffset + isoX, yOffset + isoY);
                        this.stage.addChild(tile);
                    }
                }
            }


            //Draw foreground images
            if (this.map.foreground) {
                this.drawImages(this.map.foreground);
            }

            this.renderStage();
            $(".game").prepend(this.renderer.view);
        },

        drawImages: function(images) {
            for (i in images) {
                image = images[i];
                var sprite = PIXI.Sprite.fromImage("img/"+image.img);
                sprite.position.x = (image.offset)? image.offset.x : 0;
                sprite.position.y = (image.offset)? image.offset.y : 0;
                this.stage.addChild(sprite);
            }
        },

        renderStage: function(mapFilePath) {
            this.renderer.render(this.stage);
            requestAnimFrame(this.renderStage.bind(this));
        },

        // Function to draw a isometric tile
        isoTile: function (backgroundColor, borderColor, w, h) {
            var self = this,
                h_2 = h/2;

            return function(x, y) {
                var graphics = new PIXI.Graphics();

                graphics.buttonMode = true;
                graphics.interactive = true;
                graphics.setInteractive(true);

                graphics.alpha = 0.3;
                graphics.beginFill(backgroundColor);
                graphics.lineStyle(1, borderColor, 1);
                graphics.moveTo(x, y);
                graphics.lineTo(x + w, y + h_2);
                graphics.lineTo(x, y + h);
                graphics.lineTo(x - w, y + h_2);
                graphics.lineTo(x , y);
                graphics.endFill();

                graphics.hitArea = new PIXI.Polygon([x,y, x+w,y+h_2, x,y+h, x-w,y+h_2, x,y]);

                graphics.click = graphics.touchstart = function(data) {
                    self.game.socket.emit(Types.Messages.MOVE, {
                        x: x - self.game.player.size.width / 2,
                        y: y + h_2 - self.game.player.size.height,
                    });
                };

                graphics.mouseover = function(data) {
                    this.alpha = 0.7;
                };

                graphics.mouseout = function(data) {
                    this.alpha = 0.3;
                };

                return graphics;
            }
        }

    });

    return GameRenderer;
});
