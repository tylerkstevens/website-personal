---
title: "Bitcoin Miners Heating My Home? How Many Do I Need?"
description: "A friend asked me how many bitcoin miners she'd need to service her heated floor system in her mountain home. Here's how I calculated it."
pubDate: "June 20 2024"
heroImage: "/blogimages/post9/miner_sizing.png"
tags: ["bitcoin","mining","thermodynamics","energy"]
badge: "BLOG"
---

## Background

Following my Denver BitDev's presentation on waste heat reuse from bitcoin mining machines, a local bitcoiner and friend of mine inquired about implementing ASIC heating into the hydronic flooring of her mountain home. Here's a breakdown of how we determined the sizing and feasibility of the upgrade.

*Check out the video of my Denver BitDevs' heat reuse presentation <a href="https://www.youtube.com/watch?v=bTXjEke-AbU" target="_blank">here</a>.*

## Process

My approach began with an energy audit assessment of her home and heating system. I gathered the necessary inputs to perform a thermo-economic analysis and determine the feasibility of the upgrade. Key information included the energy source for the existing hydronic heating system, energy cost, and the amount of energy used throughout the heating season.

Her existing system is a resistive, electrically heated hot water tank, separate from her main water and forced air systems. This was perfect for upgrading to a bitcoin heating system because the principles are identical: **a bitcoin mining ASIC is a resistive electric heater that also produces hash rate.**

Next we determined:
- Energy Cost = Logged into the utility account to find [$/kWh]
- Size of Exisitng Heater = Look at part & product information listed on the electric water heater
- Total Energy Consumed = Examined kWh energy consumption listed per month inside utility account

## Sizing

Just because the electric water heater had 3400 [W] listed on the side of it with all the other product information, does not mean that we can assume 3400 [W] was consumed at constant load throughout the entire winter.

So how did we calculate the actual energy consumption?

### Model Fidelity

On the low end of the fidelity spectrum, we'd assume 3400 [W] of constant electrical power, converted into heat, and dissipated throughout the home during the heating season. Conversely, we could overcomplicate the analysis by building a detailed thermal model of the system and heat flow. This would factor in things like insulaton R value, home volume, heating pipe surface area, and ambient temperatuere - all to help us estimate a heat loss rate throughout the year.

A good middle ground for calculating heat load throughout the seaon is the Heating Degree Day (HDD) method. This is a method used to estimate the energy needed to heat a building at a given ambient temperature. It is based on the idea that heating requirements are proportional to the difference between a *base temperature* and the average outside ambient temperature.

*Base temperature is often defined as 65°F (18°C). At ambient temperatures equal to or above this value, we assume no heat is required. For temperatures below 65°F, we assume energy is consumed to provide a heating load to the home.*

---

**HDD = Base Temperature - Average Daily Temperature**

**Example:** If the average daily temperature is 50°F (10°C) and the base temperature is 65°F, the HDD for that day is 15.

*HDD = 65°F - 50°F = 15°F*

*Here's a great <a href="https://www.weather.gov/wrh/climate" target="_blank">resource</a> for historical HDD data.*

---

If we know the total energy consumption of the electric water heater over a given month, as well as the monthly sum of HDD that were below 65°F, we can calculate the approximate amount of heat energy used per HDD. This can help us calculate an estimate for heat energy used during other months, where we don't explicity know the heat consumption quantity, but we have historical temperature data.

---

**Q_HDD_rate = Q_month / HDD_month**

**Example:** If 2000 [kWh] of energy was consumed by the electric water heater during the month of January, and the monthly sum of HDD below 65°F in January was 1000 HDD, the the energy consumption per HDD for the heating system is 2.0.

*Q_HDD_rate_Jan = 2000 [kWh] / 1000 HDD = 2.0 [kWh/HDD]*

---

### Isolating Electric Energy Consumption for Heating

In the case of my friend's hot water heater for her hydronic system, how did we determine the exact amount of electric energy consumed over a given month? Since this system uses electricity to supply heat to the flooring, her heat energy consumption is mixed in with her other electric consumption in the utility bill.

The simplest way to isolate the electric energy consumed for floor heating is to compare her electric utility bills during the coldest and warmest months of the year. In this case, January to August. From these bills, we can compare the total energy consumption.

To illustrate, say you consumed a total of 2500 [kWh] during the month of January (when it was coldest), but only 500 [kWh] during the month of August (when it was warmest). From this information, we can extrapolate that 2000 [kWh] was used by the electric water heater for floor heating in January, while the remaining 500 [kWh] was used to power other home equipment such as lights and electronics.

### Reference Month

It's important that we use the coldest month of the year to determine the sizing and consumption of these heating systems. A design condition, sometimes called a reference condition, is used to determine baseline sizing for the system, to ensure that the heater can meet the desired heat load at peak demand.

### Translating Energy to Power

Back to my friend's heated floor system:

This system consumed around 2000 [kWh] during the coldest month of January. There are 31 days in the month, or 744 hours.

*2000 [kWh] / 744 hr = 2.69 [kW]*

This is far below the 3.4 [kW] power rating of the electric water heater, indicating the system was shut down some days, or more likely, it is oversized for the heating of the home flooring, even during the coldest month of the year. A modern bitcoin miner consuming at least 3.0 [kW] should suffice.

### Operation During Warmer Months

During warmer months, the total HDD will be less (fewer days below 65°F). From our desing condition month of January, we know that approximately 2000 [kWh] are consumed for 1000 HDD, or 2.0 [kWh]/HDD.

With this equation, we can estimate the heat load required over each subsequent month based on historical average temperature data. This can be translated into a constant load power consumption by the bitcoin miner, downclocked from it's 2.69 [kW] design condition, or a duty cycle, that defines the percentage of time over the month that the system is de-activated.

---

**Q_month = Q_HDD_rate_month * HDD**

**Example:** If the total sum of HDD below the 65°F base temperature for the month of May is only 275 HDD and the rate of heat consumption per HDD is 2.0 [kWh/HDD], approximately how much heat energy will the electrc heating system consume over the month?

*Q_May = 2.0 [kWh/HDD] * 275 HDD = 550 [kWh]*

*Constant Power Load = 550 [kWh] / 744 hrs (May) = 0.739 [kW]*

*Duty Cycle = 550 [kWh] (May consumption) / 2000 [kWh] (January Design Condition) = 28% uptime*

---

The example above shows that during the month of May, only 740 [W] of continuous power are required compared to 2690 [W] during the month of January. This is a 72 % underclock. Another way to interperate this data is with Duty Cycle. The May duty cycle comes out to 28%, indicating that nearly 3/4 of the days in May, the system likely does not need to be turned on.

More realistically, the system probably remains on at constant steady state operation under the full load of 2.69 [kW], even if it's warmer outside. This is a simpler solution than dynamic control, and the heated flooring then only needs to be cycled on or off once per heating season. The tradeoff to this methodology is fluxuations in temperature of the heated floor, especially when the floor cannot reject the heat as efficiently during warm days.

## Conculsion

By leveraging HDD and utility bills, we effectively sized a bitcoin miner heating system for my friend’s hydronic flooring, ensuring adequate heating while offsetting utility costs with mining rewards!

*Make sure to reach out if you have any questions, or want to take a peak at the modeling!*