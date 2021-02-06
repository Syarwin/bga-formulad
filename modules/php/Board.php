<?php
namespace FORD;
use FORD\Game\Globals;
use FORD\Game\Players;

/*
 * Board: all utility functions concerning the board
 */
class Board
{
  // Globals::getCircuit() to get circuit id

  public function setupNewGame($players, $options)
  {
    // TODO : really something to do here ??
  }


  public function getUiData()
  {
    return [];
  }



  public function getPlayersOrder()
  {
    // TODO
    return Players::getAll()->getIds();
  }
}
