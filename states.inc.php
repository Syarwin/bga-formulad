<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FormulaD implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * FormulaD game states description
 *
 */

 $machinestates = [
   // The initial state. Please do not modify.
   ST_GAME_SETUP => [
     "name" => "gameSetup",
     "description" => "",
     "type" => "manager",
     "action" => "stGameSetup",
     "transitions" => [ "" => ST_START_OF_TURN ]
   ],

   // Start of turn : draw the cards
   ST_START_OF_TURN => [
     "name" => "startOfTurn",
     "description" => "",
     "type" => "game",
     "action" => "stStartOfTurn",
     "transitions" => ['' => ST_CHOOSE_SPEED]
   ],


   ST_CHOOSE_SPEED => [
     "name" => "playerChooseSpeed",
     'description' => clienttranslate('${actplayer} must choose his speed'),
     'descriptionmyturn' => clienttranslate('${you} must choose your speed'),
     'type' => 'activeplayer',
     'args' => 'argChooseSpeed',
     'possibleactions' => ['actChooseSpeed'],
     'transitions' => [
       '' => ST_ROLL_SPEED_DICE,
     ]
   ],

   ST_ROLL_SPEED_DICE => [
     "name" => "rollSpeedDice",
     "description" => "",
     "type" => "game",
     "action" => "stRollSpeedDice",
     "transitions" => [
       '' => ST_PLAYER_MOVE,
     ]
   ],

   ST_PLAYER_MOVE => [
     "name" => "playerMove",
     'description' => clienttranslate('${actlayer} must move ${n} slots'),
     'descriptionmyturn' => clienttranslate('${you} must move ${n} slots'),
     'type' => 'activeplayer',
     'args' => 'argPlayerMove',
     'possibleactions' => ['actChooseTrajectory'],
     'transitions' => [
       '' => ST_END_OF_TURN,
     ]
   ],



   // Player end of turn
   ST_END_OF_TURN => [
     "name" => "endOfTurn",
     "description" => "",
     "type" => "game",
     "action" => "stEndOfTurn",
     "transitions" => [
       'nextPlayer' => ST_CHOOSE_SPEED,
       'nextTurn' => ST_START_OF_TURN,
       'endOfGame' => ST_GAME_END,
     ]
   ],

    // Final state.
   // Please do not modify (and do not overload action/args methods).
   ST_GAME_END => [
     "name" => "gameEnd",
     "description" => clienttranslate("End of game"),
     "type" => "manager",
     "action" => "stGameEnd",
     "args" => "argGameEnd"
   ]
 ];
