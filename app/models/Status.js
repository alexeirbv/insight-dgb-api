'use strict';
//var imports       = require('soop').imports();

var async     = require('async');
var bitcore   = require('digibyte');
var RpcClient = require('digibyted-rpc');
var config    = require('../../config/config');
var rpc       = new RpcClient(config.bitcoind);
var bDb       = require('../../lib/BlockDb').default();
var _         = require('lodash');

function Status() {}


Status.prototype.getInfo = function(next) {
  var that = this;
  async.series([
    function (cb) {
      rpc.getBlockchainInfo(function(err, info){
        if (err) return cb(err);

        that.info = info.result;
        return cb();
      });
    },
    function (cb) {
      rpc.getNetworkInfo(function(err, info) {
        _.extend(that.info, _.extend(info.result));
        return cb();
      })
    }
  ], function (err) {
    return next(err);
  });
};

Status.prototype.getDifficulty = function(next) {
  var that = this;
  async.series([
    function (cb) {
      rpc.getDifficulty(function(err, df){
        if (err) return cb(err);

        that.difficulty = df.result;
        return cb();
      });
    }
  ], function (err) {
    return next(err);
  });
};

Status.prototype.getTxOutSetInfo = function(next) {
  var that = this;
  async.series([
    function (cb) {
      rpc.getTxOutSetInfo(function(err, txout){
        if (err) return cb(err);

        that.txoutsetinfo = txout.result;
        return cb();
      });
    }
  ], function (err) {
    return next(err);
  });
};

Status.prototype.getBestBlockHash = function(next) {
  var that = this;
  async.series([
    function (cb) {
      rpc.getBestBlockHash(function(err, bbh){
        if (err) return cb(err);

        that.bestblockhash = bbh.result;
        return cb();
      });
    },

  ], function (err) {
    return next(err);
  });
};

Status.prototype.getLastBlockHash = function(next) {
  var that = this;
  bDb.getTip(function(err,tip) {
    that.syncTipHash = tip;
    async.waterfall(
      [
        function(callback){
          rpc.getBlockCount(function(err, bc){
            if (err) return callback(err);
            callback(null, bc.result);
          });
        },
        function(bc, callback){
          rpc.getBlockHash(bc, function(err, bh){
            if (err) return callback(err);
            callback(null, bh.result);
          });
        }
      ],
        function (err, result) {
          that.lastblockhash = result;
          return next();
        }
    );
  });
};

module.exports = require('soop')(Status);
