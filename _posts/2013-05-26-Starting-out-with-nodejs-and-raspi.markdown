---
layout: posts
title: Starting out with node.js and raspberry pi
category: Coding
tags: javascript node.js raspi 
year: 2013
month: 5
day: 26
published: true
summary: How to get node.js running on your raspi and interact with the gpio.
image: nodejs-raspi.png
---

In this post i'll try and show you how you can get started with node.js on the raspberry pi and how to interact with the gpio-pins on it.

###Installing node.js on the raspberry pi

Fortunately all the problems with the installation have been ironed out, so now you can just use the official [release](http://nodejs.org/dist/latest/) if you want to.

If you want to compile node.js yourself, you can just use the official guide (`./configure && make && sudo make install`) which you can read [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-lmde).

I've mostly used the version 0.8.23 on the pi, as the garbagecollector on the v8 included in that version seems a little bit more aggressive and therefore more suitable for a device with only 512MB of memory.

You can verify your node.js version by running `node --version`.

###Getting your hands on the gpio

The most basic way to interact with the gpio-pins on the raspi using node.js, is obviously using the [fs-module](http://nodejs.org/api/fs.html). 
This approach has the benefits of having no external dependencies and works really well on some projects, but has a problem if you want to use a pin as an interrupt. The only way to get a new value is to constantly read the file which taxes the cpu unnecessarily.

So to be able to use the gpio pins effectively we need some other way to do this.

I've tried a couple of different modules made for interracting with the gpio pins, such as the [GpiO-module](https://github.com/EnotionZ/GpiO), but ended up choosing a module called [onoff](https://github.com/fivdi/onoff) which does just what i want, without the negative effect for watching the pins.

###On with it

One of the simplest interaction with a gpio pin would be to turn a led on and off, so let's build that.

The physical connection is made from pin (i chose pin 22) to the anode of the led and from the ground to the cathode of the led, with a current-limiting resistor between the outputting pin and and the anode (270 ohm should be optimal, but slightly larger ones can be used with slightly dimmer outcomes).

The code to turn the led on and off would look something like this:

    var Gpio = require('onoff').Gpio;
    var led = new Gpio(22, 'out');

    led.write(1, function (err) {
        if (err) {
            throw err;
        } else {
            setTimeout(function () {
                led.writeSync(0);
                led.unexport();
                process.exit();
            }, 10000);
        }
    });

In the code above we first require the module and grab a single constructor function `Gpio` from it. On the next line we create a new variable called `led` which is the retur value of the constructor function, to which we pass the pin-number and direction as arguments.

Then we write a value (1) on the pin asynchronously, and declare a callback function to be called when the write is complete. In the callback we check for an error, and if none is found, set a timeout to run in 10 seconds. 
In the anon callback function of the timeout we write a new value (0), but this time synchronously, unexport the led and exit the process.

###Using a button

Connecting a button is almost the same, except this time we need to first make the connection between the pin and the button work the other direction, and for that we need to either use a pull-up or a pull-down resistor (10K ohm) for the button (and preferably a smaller 1K ohm resistor to protect the pin in a case of human error).

For this I chose the pin 17 pulled up (you can find a bunch of tutorial helping you make the connection correctly), so a simple code (including the led from above) to make use the button would be:

    var Gpio = require('onoff').Gpio;
    var led = new Gpio(22, 'out');
    var button = new Gpio(17, 'in', 'falling', { persistentWatch: true, debounceTimeout: 300 });

    button.watch(function (err, value) {
        if (err) {
            throw err;
        } else {
            led.read(function (err, value) {
                if (err) {
                    throw err;
                } else {
                    var val = value === 0 ? 1 : 0;
                    led.writeSync(val);
                }
            });
        }
    });

In this example we first create the `led` and then the `button`. When calling the constructor, we can optionally pass in the edge (`falling` in this case), and an object containing two values. The first value `persistentWatch` makes the button work on consecutive pushes, and the second value `debounceTimeout` sets a timeout to help out if your button does not debounce itself (mine didn't).

So running this code simply makes the button turn the led on and off. Awesome.

I made a [fleshed out version](https://github.com/gildean/raspi-ledblinker) of this idea with an in-memory http- and websocket-servers and a simple js-gui, check it out for more ideas on blinking your leds :D
