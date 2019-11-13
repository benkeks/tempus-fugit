"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//document.body.innerText = "Hello World";
require("phaser");
var main_scene_1 = require("./scenes/main-scene");
var config = {
    type: Phaser.AUTO,
    width: 1950,
    height: 1000,
    resolution: 1,
    backgroundColor: "#efefef",
    scene: [
        main_scene_1.MainScene
    ]
};
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game(config) {
        return _super.call(this, config) || this;
    }
    return Game;
}(Phaser.Game));
exports.Game = Game;
window.addEventListener("load", function () {
    new Game(config);
});
