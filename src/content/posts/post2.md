---
title: "ASICs Run Hot – Understanding How they Transfer Heat"
description: "This blog touches on the fundamentals of energy, thermodynamics and heat transfer - for bitcoin miners."
pubDate: "March 12 2024"
heroImage: "/blogimages/post2/ExergyInsights_ASICrunHot.png"
tags: ["bitcoin","mining","thermodynamics","energy","heat transfer"]
badge: "BLOG"

---

## Thermodynamics and Heat Transfer 101

#### What is Energy?

What even is energy? In a technical sense, energy is a property of matter that can be measured indirectly. It comes in many different types, such as: kinetic, potential, chemical, electrical, nuclear, and thermal. The way we use the term energy in conversation can be understood as the capacity to do mechanical work or transfer heat. In other words, work is the transfer of mechanical energy between systems, while heat is the transfer of thermal energy from between systems. Because work and heat are both methods of transferring energy, they can share a common unit, the Joule [J]. Power is a measure of energy vs time, denoted Joule/second [J/s], also known as the Watt [W].

#### What is Temperature?

In the context of bitcoin mining, where the system is electric, and does not have many moving parts, we care mostly about heat energy transfer. To better understand this, we need to first define temperature. Temperature is the measure of average kinetic energy (average speed) of molecules in a substance. That is, something hot, or with high temperature, has a high average particle velocity at the atomic level. No atomic movement, or the lack of heat, is defined as absolute zero on the Kelvin temperature scale, or -459.67° F. There is no temperature colder, because you cannot remove any additional kinetic energy from atoms that are not moving. Heat is a term for the form of energy that is transferred when objects in a system at different temperatures equilibrate.

#### Energy Quantity vs Quality

After defining energy and temperature, the basic premise of thermodynamics can be explained via its first two principal laws. Law one states that energy cannot be created or destroyed. Meaning, energy can only be transferred and converted into different forms. The quantity of energy is always conserved The quality of that energy, however, is not conserved. What does this mean? Energy quality is a measure of its capability of doing work, either mechanically or thermally. It's best explained via the second law, which states for a spontaneous process, the entropy of the universe always increases. That may sound confusing at first. But effectively, there is a directional nature to all processes. A process will not spontaneously reverse itself. Think about heat flowing from hot to cold, or mixing two liquids together. These phenomena will not undo themselves naturally, and it takes a lot of effort to reverse them. Entropy is the measure of the irreversibility of a process. Note, energy quality is always reduced during transformations, but we can strive for idealized efficiency!

With these concepts understood, we can define the different methods of transferring heat energy and think through their relation to bitcoin mining.

#### Conduction

Conduction is the transfer of heat energy through a material or between objects that are in direct contact. This happens through molecular collisions (remember, temperature is just atomic velocity). The heat sinks on an ASIC, for example, increase in temperature from conductive heat transfer from their material contact with the chips on the circuit board.

#### Convection

Convection is the transfer of heat energy through a fluid (gas or liquid). An example of convection is a bitcoin miner exhausting hot air, or a machine submerged in immersion dielectric fluid. The air or cooling fluid flows through the ASIC, convectively absorbing heat from the heat sinks on the circuit board. Cold in, hot out.

#### Radiation

Radiation is the transfer of heat energy through electromagnetic waves. It requires no medium or direct contact between objects. Every object with a temperature greater than absolute zero (-459.67° F) emits radiation. Even in the vacuum of space, with no convective or conductive heat transfer, a bitcoin miner would reject its heat energy through radiation into the void.

---

## Follow the Energy

Now let's follow the energy as it changes form and is transferred throughout a bitcoin miner.

**The breakdown of the process is as follows:**

1. Electric energy flows from the Power Supply Unit (PSU) through the circuit board to ASIC chips on conductive copper traces.
2. The electric energy is converted into heat energy when current flows through transistors, resistors, and interconnects within the circuit, and encounters a resistance. This causes vibrations at the atomic level, which increase temperature. Minimal energy is converted to other forms (your ASIC doesn't start making noises, moving, or chemically combusting. Otherwise you have a problem). This means the electricity is converted into heat with near perfect efficiency.
3. Heat energy conducts from the transistors, resistors, and interconnects of the ASIC to the external surface of the chip.
4. The heat energy is then conducted from the external face of the chip to a thermal paste material in the case of air and immersion cooled machines. This viscous paste serves as an interface between the chip and the heat sink placed on top of it.
5. The heat energy conducts through the thermal paste into the heat sink, where it continues to conduct along the heat sink fins.  
   1. For hydro cooled machines, no thermal paste or heat sinks are attached to the ASIC chip. Instead, a water block is connected to the chip directly, and cooling fluid jets impinge upon the chip surface.
6. At the tips of the heat sinks, with no where left to conduct, the heat must be transferred via convection to a fluid. This convection is forced in air cooled machines when high speed fans blow large volumes of air across the heat sink fins. For immersion cooling, pumps circulate a liquid through the machines instead of fans that circulate gas.

Simplified Heat Transfer Network through a Bitcoin Miner

---

## Governing Equations

So how do we calculate the amount of heat transferred from the different mechanisms outlined above? The equations may look complex, yet are quite simple and defined as follows:

**Conduction: Q = k_A_∆T**

* Where heat transferred is equal to the thermal conductivity of the material, multiplied by the cross sectional area that the heat is being transferred through, multiplied by the temperature difference between the materials.

**Convection: Q = h_A_∆T**

* Where heat transferred is equal to the convective heat transfer coefficient, multiplied by the exposed surface area interfacing with the fluid, multiplied by the temperature difference between the material surface and the surrounding fluid temperature.

**Radiation: Q = ε*σ_A_∆(T^4)**

* Where heat transferred is equal to the emissivity of the surface (determined by its surface finish), multiplied by a small (Stefan-Boltzmann) constant, multiplied by the surface area of the object, multiplied by the temperature difference of the surfaces to the fourth power.

---

## Optimizing the System

Some of these symbols may be unfamiliar to you. The key takeaway is that we now understand how to manipulate these simple equations to facilitate more or less heat transfer, depending on the desire. In the case of bitcoin miners, we want to encourage heat transfer away from the ASIC chips, to ensure they hash with high efficiency and remain reliable. 

**Let's think about conduction in relation to bitcoin miners.** In order to increase conductive heat transfer, we have a few options. We could increase the thermal conductivity of the material. This is useful to know when selecting materials for heat sinks or thermal pastes, which are designed to dissipate heat away from the ASIC chips. Additionally, we could increase the cross sectional area perpendicular to the direction of heat transfer. This is essentially what the thermal paste does in-between the ASIC chip and heat sink. Thermal paste fills microscopic gaps between the chip and the heat sink, effectively increasing the contact surface area to improve heat transfer. Finally, we could increase the temperature differential. Since conductive heat transfer is directly correlated to the temperature difference between two components, sufficiently rejecting heat and keeping heat sink fins as cool as possible, for example, will ensure your heat transfer rate from the chip remains high. We want to maximize the delta across these components.

**For convective heat transfer, the breakdown is similar.** Increasing the surface area exposed to the convecting fluid increases heat transfer. This is exactly what heat sinks and heat exchangers are designed to do. All those tiny fins on heat sinks and radiators increase the surface area of the material that interacts with the surrounding fluid. Increasing the temperature differential also increases heat transfer. What's different compared to conductive cooling is the convective heat transfer coefficient term, h, instead of thermal conductivity, k, used in the conduction equation. This term is difficult to calculate due to the complex nature of fluid flow. As a result, correlations from experimental data or predictions from CFD analyses are required to determine h. What's obvious from the equation is that increasing h will increase heat transfer. So what increases h? A handful of factors. Examples include increasing flow velocity, increasing flow turbulence, increasing fluid thermal conductivity, and reducing fluid boundary layer thickness. Without getting too into the weeds here, the general point is that we want a fluid with high thermal conductivity and to have turbulent, high speed flow, to increase h. This ensures there are no stagnated local pockets of fluid serving as a barrier (boundary layer) between our hot heat sink surface and cool convecting fluid. 

**Now consider radiation. The radiative heat transfer equation has a few more variables involved.** First, there is ε, or the emissivity of the surface emitting radiation energy. This is a unit-less value between 0-1 that quantifies how effectively a surface can emit thermal radiation. This value is heavily dependent on the surface finish and properties of the material. Then there is σ, known as the Stefan Boltzmann constant. This derived physical constant represent a proportionality between the total energy radiated per unit area and absolute temperate. Then comes the familiar surface area of the radiative emitting body, followed by a temperature delta. This time, however the temperature difference is dependent on the fourth power of the absolute temperatures on the Kelvin scale. Increasing emissivity, surface area, and the temperate difference are all ways to increase total thermal radiation heat transfer. Because the Boltzmann constant is so small (E-8), radiative heat transfer is often negligible in comparison to convection and conduction, unless the temperature difference between the two components is sufficiently large. In the context of Bitcoin miners, the temperature difference between the ASIC chip and surrounding environment is small enough that conduction and convection drive the majority of heat transfer, and radiation can be neglected.

Understanding the physics of heat transfer can serve as a useful tool for Bitcoin miners. These concepts and equations can be employed for quick calculations, sanity checks, or conceptualizing how to best reject heat from a mining operations.

In future articles, we'll dive further into the details of each method of transferring heat energy, with more examples and methods for improving miner cooling. This post serves as an introduction to the concepts. If you have questions or comments, be sure to subscribe and leave a message below!