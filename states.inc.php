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
     "transitions" => ['' => ST_BIDS]
   ],


   ST_BIDS => [
     "name" => "playerBids",
     'description' => clienttranslate('Waiting for other players to bid'),
     'descriptionmyturn' => clienttranslate('${you} must bid for the three taverns'),
     'type' => 'multipleactiveplayer',
     'args' => 'argPlayerBids',
     'action' => 'stPlayersBids',
     'possibleactions' => ['bid'],
     'transitions' => [
       'done' => ST_NEXT_RESOLUTION,
     ]
   ],


   // Player end of turn
   ST_END_OF_TURN => [
     "name" => "endOfTurn",
     "description" => "",
     "type" => "game",
     "action" => "stEndOfTurn",
     "transitions" => [
       'nextTurn' => ST_START_OF_TURN,
       'nextAge' => ST_END_OF_AGE,
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
