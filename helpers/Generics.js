const generateUniqueId = require("generate-unique-id");

var DbActions = require("../model/DbActions");
DbActions = new DbActions();

class Generics {
  async createUniqueId(tableName, column) {
    let uniqueId = generateUniqueId({
      length: 20,
      useLetters: true,
    });
    try {
      let uniqueIdExistence = await DbActions.selectSingleRow(tableName, {
        filteringConditions: [[column, "=", uniqueId]],
      });

      if (typeof uniqueIdExistence === "object") {
        this.createUniqueId(tableName, column);
      }

      if (typeof uniqueIdExistence === "undefined") {
        return {
          status: true,
          message: "Unique Id was successfully created",
          data: uniqueId,
        };
      }
    } catch (e) {
      return {
        status: false,
        message: e.message,
        data: [],
      };
    }
  }

  randomStringCreator ( $type = 'alnum', $len = 8 )
  {
    let $pool = '';
    switch ( $type )
    {
      case 'alnum'	:
      case 'numeric'	:
      case 'nozero'	:

        switch ($type)
        {
          case 'alnum'	:	$pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            break;
          case 'numeric'	:	$pool = '0123456789';
            break;
          case 'nozero'	:	$pool = '123456789';
            break;
        }

        let $str = '';
        for ( let $i=0; $i < $len; $i++ )
        {
          $str += $pool.charAt(Math.floor(Math.random() * $pool.length));
        }
        return $str;
        break;
      case 'unique' : return Math.floor(Math.random());//md5 ( uniqid ( mt_rand () ) );
        break;
    }
  }
}

module.exports = Generics;
