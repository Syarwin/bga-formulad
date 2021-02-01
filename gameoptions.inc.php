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
 * gameoptions.inc.php
 *
 * FormulaD game options description
 *
 */

$game_options = [
  OPTION_CIRCUIT => [
    'name' => totranslate('Circuit'),
    'values' => [
      CIRCUIT_MONACO => [
        'name' => totranslate('Monaco'),
        'description' => totranslate('Monaco'),
        'tmdisplay' => totranslate('Monaco')
      ],
    ]
  ],
];
