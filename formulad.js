/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FormulaD implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * formulad.js
 *
 * FormulaD user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
  "dojo","dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  g_gamethemeurl + "modules/js/game.js",
],
function (dojo, declare) {
  return declare("bgagame.formulad", [
    customgame.game,
  ], {

    constructor(){
//      this._notifications.push(      );
    },


    /*
     * Setup:
     *	This method set up the game user interface according to current game situation specified in parameters
     *	The method is called each time the game interface is displayed to a player, ie: when the game starts and when a player refreshes the game page (F5)
     *
     * Params :
     *	- mixed gamedatas : contains all datas retrieved by the getAllDatas PHP method.
     */
    setup(gamedatas) {
      debug('SETUP', gamedatas);

/*
      this.setupPlayers();
*/

      this.inherited(arguments);
    },



    clearPossible(){
      /*
      this._callbackOnCard = null;
      this._selectableCards = [];
      this._callbackOnPlayer = null;

      dojo.query(".task").removeClass("unselectable selectable tile-selectable tile-selected selected");
      */

      this.inherited(arguments);
    },

 });
});
