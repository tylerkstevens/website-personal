---
title: "Exergy - What is it?"
description: "Conservation of energy quantity, not conservation of energy quality."
pubDate: "2024-02-22"
tags: ["bitcoin", "mining", "thermodynamics", "energy"]
badge: "BLOG"
---

## Introduction

Yesterday I posted a thread on my X profile covering a basic introduction to the concept of _exergy_. I wanted to post my morning thoughts about the definition of exergy and how it is useful way to think through bitcoin mining operations as an _energy_ system. Here I'll go into a bit more detail.

## Recap

Exergy is a measure of the maximum amount of useful _work_ that is possible during a process that brings a system into equilibrium with its surrounding environment. In simpler terms, it's a measure of how useful energy in a system is, which we call quality. Work, as the term is used here, is defined as force \* distance. It can be microscopic like heat transfer (thermal work), or macroscopic, such as literally exerting force to lift a bitcoin miner over some distance by putting it onto a rack.

The first law of thermodynamics states that energy in a system is always conserved. It cannot be created nor destroyed. Only transferred. If we define a system (bitcoin mine), the energy flowing in and out of that site is constant. The _quantity_ is fixed. The _quality_ of the energy in the system is **not** fixed. Energy quality is related to the second law of thermodynamics. It states that the _entropy_ of a system is always increasing for a spontaneous process, where entropy can be thought of as disorder or randomness. That is, for spontaneous processes, energy quality naturally decreases. Thus, as entropy increases, exergy decreases. They are both ways of thinking about quality of energy, or how useful it is in a system. In the context of a bitcoin mine, high quality electric energy is input. It has a high capacity for doing work (can be used to run ASICs, power pumps, AC, lights, etc…). Bitcoin ASICs convert that electric energy into heat energy with near perfect efficiency (negligible energy is lost to sound or light or motion). The resulting output is effectively the exact amount of electric energy that was input, but now all in the form of heat energy. Because this heat energy is less useful for doing work (cannot be easily used to power pumps or lights or other processes) it has a lower quality than the electric energy input. This is a decrease in the system exergy (its capacity to do work), and an increase in the system entropy. Think about how much effort it would take to capture and convert all that heat energy back into electricity. Effectively impossible, hence entropy increases. The process is irreversible.

If you'd like to see some quick math that quantifies the electric input exergy and heat output exergy of a 1 MW bitcoin mine, check out some of the later posts in the thread:

> What is Exergy, and why should #bitcoin miners care? 🧵👇🏻
> 
> Exergy is defined as the maximum amount of work that can be done while bringing a system into equilibrium with its surroundings. Basically, it's a measure of the usefulness of energy in a system.
> 
> — Tyler Stevens ⚡️ (@tylerkstevens) February 20, 2024

My point here was just to show how small the maximum amount of useful energy is exhausted in the form of heat from a 1 MW bitcoin mine. Just under 93 kW. Of the 1 MW of heat energy output from the system, only 9% of it has the capacity to do work in an ideal scenario. The remaining 907 kW of heat is just that. Heat.

## Conclusion

Only 9% of the heat energy is useful? You may ask. Well, yes, if we want to use the heat directly to perform some kind of work… There are novel ways to increase the usefulness of this exergy by adding additional energy to the heat. Things like heat pumps, absorption chillers, and other thermo-mechanical devices. But these require additional energy being added to the system. They are beyond the scope of what I am discussing in this example, however, I'll likely cover them in the future.

But what if we value the heat by itself? Then, I would say it is useful! Just not in the technical definition of the term. And this is my point. Just because the quality of energy is drastically reduced when bitcoin miners convert electricity to heat, we can still use it in other applications where it is valuable.

The concept of exergy can be useful for assessing energy in a system, and for optimizing it to be as useful as possible. I predict a future where exhausted exergy from miners is used as efficiently as possible. The heat energy capable of doing work will be used to do so. Either converting it back into electricity to run auxiliary equipment, or possibly even turning it into a cooling load to provide relief to the system. The remaining waste-heat will be used in applications where it can be monetized or is valued.

Pleb miners are on the forefront here. There are hundreds of home miners using ASICs to heat their homes, water, hot tubs, pools, and more. For them, heat is most important, and the bitcoin mined is a subsidy. At the industrial scale, heat reuse is less common. I do not expect this to last forever. As block subsidies continue to decrease through halving events and energy prices and competition rise, miners across the board will have to start treating the heat for what it is. A product.

More to come on these topics in the future. Make sure you are subscribed to Exergy Insights so you don't miss a publication. Let me know your thoughts in the comments below!

Cheers!
