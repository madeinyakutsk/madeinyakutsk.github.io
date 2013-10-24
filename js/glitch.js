/**
 * glitch.js
 *
 * Inspired by http://sjhewitt.github.io/glitch.js
 *
 * Released under MIT License.
 * Copyright (c) 2013 Kolesnikov Danil.
 */

~ function() {

  function rand(min, max) {
    return ~~(Math.random() * (max - min + 1) + min)
  }


  function Glitch(canvas) {
    this.canvas = canvas,
    this.context = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
  }

  Glitch.prototype.imageData = function() {
    return this.context.getImageData(0, 0, this.width, this.height)
  }

  Glitch.prototype.shiftColor = function(initial, offset, bright) {
    var srcData = this.imageData().data,
        imageData = this.imageData(),
        data = imageData.data

    bright = bright || 1
    offset = (offset || 0) * 4

    for (var i = initial, j = initial, l = srcData.length; i < l; i += 4, ++j) {
      data[i + offset] = srcData[i] * bright

      if (bright != 1) {
        data[j++] *= bright
        data[j++] *= bright
        data[j++] *= bright
      }
    }

    this.context.putImageData(imageData, 0, 0)

    return this
  }

  Glitch.prototype.shiftLines = function(count, offset) {
    var w = this.width,
        h = this.height,
        bx, by, bw, bh

    for (var i = 0; i < count; ++i) {
      bx = rand(1, offset)
      by = rand(1, h)
      bw = w - bx
      bh = rand(1, h)

      this.context.drawImage(this.canvas, 0, by, bw, bh, bx, by, bw, bh)
    }

    return this
  }

  Glitch.prototype.addScanLines = function(alpha) {
    var w = this.width,
        h = this.height,
        c = this.context

    c.fillStyle = 'rgba(0,0,0,' + (alpha || 1) + ')'

    for (var i = 0; i < h; i += 2) {
      c.fillRect(0, i, w, 1)
    }

    return this
  }


  // Page glitching.

  var glitching = false


  function glitch(el, amount, done) {
    if (glitching) {
      return
    }

    glitching = true

    html2canvas(el, {
      onrendered: function(canvas) {
        amount = rand(1, 3)

        // Light "stereoglitch".
        new Glitch(canvas)
          .shiftColor(0, amount * rand(-20, 20), 1.4)
          .shiftLines(amount * rand(10, 20), rand(5, 10))
          .addScanLines(.2)

        blink(el, canvas, function() {
          glitching = false
          done && done()
        })
      }
    })
  }


  function blink(el, canvas, done) {
    var par = el.parentNode,
        t = rand(100, 300)

    par.insertBefore(canvas, el)

    function end() {
      par.removeChild(canvas)
      done && done()
    }

    function shortBlink() {
      canvas.style.display = 'none'

      setTimeout(function() {
        canvas.style.display = ''

        setTimeout(end, 40)
      }, 40)
    }

    setTimeout(function() {
      if (t < 150) {
        end()
      } else {
        shortBlink()
      }
    }, t)
  }


  ~ function glitchLoop() {
    setTimeout(function() {
      glitch(document.body)
      glitchLoop()
    }, rand(1000, 3000))
  }()
}()
