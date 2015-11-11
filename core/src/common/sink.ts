/** @module Common **/
"use strict";

/**
 * Accepts and buffers player movement data
 * and periodically sends it to the data sink.
 *
 * @class
 * @param {Integer} Game identifier
 * @param {String} Name of the current level
 */
class Sink
{
  private sendingInProgress: boolean;
  private sinkAddress: string;
  private transmitAutomatically: boolean;
  private transmitEvery: number;
  
  private id: number;
  private buffer: { [key: number]: any };

  
  constructor(sinkAddress: string)
  {
    this.sendingInProgress = false;
    this.sinkAddress = sinkAddress;
  
    this.transmitAutomatically = true;
    this.transmitEvery = 1;
  
    this.id = 0;
    this.buffer = {};
  }


  /**
   * Append data to buffer.
   *
   * @param {Object} Object to send
   * @returns {Integer} Id of the transmitted move
   */
  appendData(data: any): void
  {
    data.id = this.id;
    this.buffer[this.id] = data;
    this.id++;

    if(this.transmitAutomatically && (this.id % this.transmitEvery) === 0)
      this.transmitData();

    return data.id;
  };


  /**
   * Explicitly attempt to transmit data to server.
   */
  transmitData(): void
  {
    if(this.sendingInProgress)
      return;

    this.sendingInProgress = true;

    // Send moves to server
    jQuery.ajax({
      url: this.sinkAddress,
      data: JSON.stringify(this.buffer),
      contentType: 'text/plain',
      dataType: 'json',
      method: 'POST'
    }).done(function(result) {
      // Remove moves from buffer that were successfully sent
      for(var i in result) {
        if(result[i] in this.buffer)
          delete(this.buffer[ result[i] ]);
      }

      this.sendingInProgress = false;
    }.bind(this)).fail(function() {
      this.sendingInProgress = false;
    }.bind(this));
  };
}
