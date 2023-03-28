---
ordering_key: 7.5
title: Ga-Me
dinfo: April 2021
ptags: code hosted circuit
tech: arduino esp32 espnow
oneline: A game of Pong split across three portable screens
hostedlink: https://github.com/Dx724/Ga-Me
---
![Photo of the three Ga-Me devices showing the Pong and generative art components](/res/ga_me.jpg "Ga-Me")
- A Pong game is split across three devices. The left and right players control paddles while the middle player can influence the ball
- The Pong game is rendered only on the screen where the ball currently is
- The other two devices show generative art interfaces
- However, when the ball reaches your screen, the work of art you've created is deleted
- Keep the ball away so you can enjoy the creative process!
\
\
- Control of game state is transferred between devices using ESP-NOW, allowing for a low-power, lag-free experience
- Created for Columbia's Creative Embedded Systems course