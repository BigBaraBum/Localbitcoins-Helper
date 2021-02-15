// ==UserScript==
// @name         Localbitcoins Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://localbitcoins.net/ad/*
// @match         https://localbitcoins.net/accounts/wallet/

// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  let outgoingFee = 0;
  let total = 0;
  if (window.location.pathname == "/accounts/wallet/") {
    $("#sendformBtn").click(function () {
      let wallet = $("#div_id_address_to input").val();
      $.ajax({
        url: 'http://localhost:3000/wallet',
        wallet: wallet.toString()
      });
    });
  } else {
    renderMenuTrade();
    console.log("hi");
  }

  $(window).on("load", function () {});
  getFee();
  getLastBlocks();
  function renderMenuTrade() {
    $("<div>")
      .appendTo("body")
      .css({
        position: "fixed",
        top: "600px",
        right: "0",
        //width: "150px",
        //height: "150px",
        "font-size": "21px",
        "background-color": "rgba(255,255,255,1)",
        border: "3px solid blue",
        "z-index": "99999999"
      })
      .addClass("my-menu")
      .append("<p>Transaction fee: <span id='transaction-fee'></span></p>")
      .append("<input id='first-input' type='text' placeholder='Enter first price'>")
      .append("<input id='second-input' type='text' placeholder='Enter second price'>")
      .append("<p>Total price btc: <span id='total-btc'></span>")
      .append("<input id='address' placeholder='Address to watch'>")
      .append("<p>Confirmations: <span id='confirmations'></span>")
      .append("<p>Last blocks (in mins):</p>")
      .append("<ul id='last-blocks'><ul>");
  }
  $(".my-menu input").on("input", function () {
    total = Number($("#first-input").get(0).value) + Number($("#second-input").get(0).value) + Number(outgoingFee);
    renderTotal();
    $("#btcinput").val(total);
  });
  function getLastBlocks() {
    $.ajax({
      url: "https://sochain.com/api/v2/get_info/BTC",
      success: function (response) {
        $("#last-blocks").empty();
        for (let index = 0; index < 5; index++) {
          let block = response.data.blocks - index;
          $.ajax({
            url: "https://sochain.com/api/v2/get_block/BTC/" + block,
            success: function (response) {
              let time = new Date(response.data.time * 1000);
              let today = new Date();
              let differenceTime = Math.floor((today - time) / (60 * 1000));
              $("#last-blocks").append("<li>" + differenceTime + " minutes #" + response.data.block_no);
            }
          });
        }
      }
    });
  }
  function getFee() {
    $.ajax({
      url: "https://localbitcoins.net/api/fees/",
      dataType: "json",
      success: function (response) {
        outgoingFee = response.data.outgoing_fee;
        renderFee();
        renderTotal();
      },
      error: function (error) {
        console.log(error);
      }
    });
  }
  function renderTotal() {
    $("#total-btc").get(0).textContent = total;
  }
  function renderFee() {
    $("#transaction-fee").get(0).textContent = outgoingFee;
  }
})();
