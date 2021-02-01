<?php
namespace FORD\Game;
use FormulaD;

class Stats
{
  protected static function init($type, $name, $value = 0){
    FormulaD::get()->initStat($type, $name, $value);
  }

  public static function inc($name, $player = null, $value = 1, $log = true){
    $pId = is_null($player)? null : ( ($player instanceof \NID\Player)? $player->getId() : $player );
    FormulaD::get()->incStat($value, $name, $pId);
  }


  protected static function get($name, $player = null){
    FormulaD::get()->getStat($name, $player);
  }

  protected static function set($value, $name, $player = null){
    $pId = is_null($player)? null : ( ($player instanceof \NID\Player)? $player->getId() : $player );
    FormulaD::get()->setStat($value, $name, $pId);
  }


  public static function setupNewGame(){
    /*
    TODO

    self::init('table', 'turns_number');
    self::init('table', 'ending', 0);

    $stats = FormulaD::get()->getStatTypes();
    foreach ($stats['player'] as $key => $value) {
      if($value['id'] > 10 && $value['type'] == 'int' && $key != 'empty_slots_number')
        self::init('player', $key);
    }
    self::init('player', "empty_slots_number", 33);
    */
  }
}

?>
