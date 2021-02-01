<?php
namespace FORD\Game;
use FormulaD;

class Notifications
{
  protected static function notifyAll($name, $msg, $data){
    self::updateArgs($data);
    FormulaD::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($pId, $name, $msg, $data){
    self::updateArgs($data);
    FormulaD::get()->notifyPlayer($pId, $name, $msg, $data);
  }


  public static function message($txt, $args = []){
    self::notifyAll('message', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = []){
    $pId = ($player instanceof \NID\Player)? $player->getId() : $player;
    self::notify($pId, 'message', $txt, $args);
  }


  public static function startNewTurn(){
    self::notifyAll('newTurn', clienttranslate('Starting turn ${turn} of first age'), [
      'turn' => Globals::getTurn(),
    ]);
  }


  /*
   * Automatically adds some standard field about player and/or card/task
   */
  public static function updateArgs(&$args){
    if(isset($args['player'])){
      $args['player_name'] = $args['player']->getName();
      $args['player_id'] = $args['player']->getId();
      unset($args['player']);
    }
  }
}

?>
